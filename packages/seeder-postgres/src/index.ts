import { knex } from "knex";
import schemaInspector from "knex-schema-inspector";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

import { Seeder } from "@chehsunliu/seeder";

export type DataSelector = {
  type: "sql" | "json";
  getFilename: (tableName: string) => string;
};

type Props = {
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  dataSelectors: DataSelector[];
  excludedTables?: string[];
};

type Metadata = {
  tables: TableInfo[];
};

type TableInfo = {
  tableName: string;
  jsonColumns: Set<string>;
};

export class PostgresSeeder implements Seeder {
  private readonly connectionInfo: Props["connection"];
  private readonly pool: Pool;
  private readonly dataSelectors: DataSelector[];
  private readonly excludedTables: Set<string>;

  private metadata?: Metadata;

  constructor(props: Props) {
    this.connectionInfo = props.connection;
    this.pool = new Pool({ ...props.connection });
    this.dataSelectors = props.dataSelectors;
    this.excludedTables = new Set(props.excludedTables);
  }

  truncate = async (): Promise<void> => {
    const metadata = await this.getMetadata();
    const client = await this.pool.connect();
    try {
      for (const info of metadata.tables) {
        await client.query(`truncate table "${info.tableName}" restart identity cascade`);
      }
    } finally {
      client.release(true);
    }
  };

  seed = async (folder: string): Promise<void> => {
    const metadata = await this.getMetadata();

    const tasks = [];
    for (const info of metadata.tables) {
      for (const dataSelector of this.dataSelectors) {
        const filepath = path.join(folder, dataSelector.getFilename(info.tableName));
        if (!fs.existsSync(filepath)) {
          continue;
        }

        if (dataSelector.type === "sql") {
          tasks.push(this.seedSqlData({ filepath }));
        } else if (dataSelector.type === "json") {
          tasks.push(this.seedRawJsonData({ tableInfo: info, filepath }));
        }

        break;
      }
    }

    await Promise.all(tasks);
  };

  release = async (): Promise<void> => {};

  private getMetadata = async (): Promise<Metadata> => {
    if (this.metadata !== undefined) {
      return this.metadata;
    }

    const k = knex({
      client: "pg",
      connection: this.connectionInfo,
    });

    try {
      const inspector = schemaInspector(k);
      const tableNames = await inspector.tables().then((ts) => ts.filter((t) => !this.excludedTables.has(t)));

      const tables: TableInfo[] = [];
      for (const tableName of tableNames) {
        const columns = await inspector.columnInfo(tableName);
        const jsonColumns = columns.filter((col) => col.data_type === "json").map((col) => col.name);
        tables.push({
          tableName,
          jsonColumns: new Set(jsonColumns),
        });
      }

      return { tables };
    } finally {
      await k.destroy();
    }
  };

  private seedSqlData = async (args: { filepath: string }) => {
    const buffer = fs.readFileSync(args.filepath);
    const client = await this.pool.connect();
    try {
      await client.query(buffer.toString());
    } finally {
      client.release(true);
    }
  };

  private seedRawJsonData = async (args: { tableInfo: TableInfo; filepath: string }) => {
    const buffer = fs.readFileSync(args.filepath);
    const items = <object[]>JSON.parse(buffer.toString());
    if (items.length === 0) {
      return;
    }

    const normalizedItems = items.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([k, v]) => (args.tableInfo.jsonColumns.has(k) ? [k, JSON.stringify(v)] : [k, v])),
      ),
    );

    const fieldString = Object.keys(normalizedItems[0])
      .map((item) => `"${item}"`)
      .join(",");
    const valueString = [...Array(Object.keys(normalizedItems[0]).length).keys()].map((i) => `$${i + 1}`).join(",");

    const tasks = normalizedItems.map(async (item) => {
      const client = await this.pool.connect();
      try {
        await client.query("set session_replication_role = 'replica'");
        await client.query(
          `insert into "${args.tableInfo.tableName}" (${fieldString}) overriding system value
           values (${valueString})`,
          Object.values(item),
        );
      } finally {
        client.release(true);
      }
    });

    await Promise.all(tasks);
  };
}
