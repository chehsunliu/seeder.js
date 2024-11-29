import { knex, Knex } from "knex";
import schemaInspector from "knex-schema-inspector";
import fs from "node:fs";
import path from "node:path";

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

export class MySqlSeeder implements Seeder {
  private readonly connectionInfo: Props["connection"];
  private readonly dataSelectors: DataSelector[];
  private readonly excludedTables: Set<string>;

  private knex?: Knex;
  private metadata?: Metadata;

  constructor(props: Props) {
    this.connectionInfo = props.connection;
    this.dataSelectors = props.dataSelectors;
    this.excludedTables = new Set(props.excludedTables);
  }

  truncate = async (): Promise<void> => {
    const metadata = await this.getMetadata();

    const tasks = [];
    for (const info of metadata.tables) {
      tasks.push(this.getKnex()(info.tableName).truncate());
    }
    await Promise.all(tasks);
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

  release = async (): Promise<void> => {
    if (this.knex === undefined) {
      return;
    }

    const tmpKnex = this.knex;
    this.knex = undefined;
    await tmpKnex.destroy();
  };

  private getKnex = (): Knex => {
    if (this.knex !== undefined) {
      return this.knex;
    }

    this.knex = knex({
      client: "mysql2",
      connection: {
        ...this.connectionInfo,
        multipleStatements: true,
      },
      pool: {
        afterCreate: (conn: any, done: any) => {
          conn.query("SET FOREIGN_KEY_CHECKS = 0", (err: any) => done(err, conn));
        },
      },
    });
    return this.knex;
  };

  private getMetadata = async (): Promise<Metadata> => {
    if (this.metadata !== undefined) {
      return this.metadata;
    }

    const inspector = schemaInspector(this.getKnex());
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
  };

  private seedSqlData = async (args: { filepath: string }) => {
    const buffer = fs.readFileSync(args.filepath);
    await this.getKnex().raw(buffer.toString());
  };

  private seedRawJsonData = async (args: { tableInfo: TableInfo; filepath: string }) => {
    const buffer = fs.readFileSync(args.filepath);
    const items = <object[]>JSON.parse(buffer.toString());

    const normalizedItems = items.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([k, v]) => (args.tableInfo.jsonColumns.has(k) ? [k, JSON.stringify(v)] : [k, v])),
      ),
    );
    await this.getKnex()(args.tableInfo.tableName).insert(normalizedItems);
  };
}
