import {
  DynamoDBClient,
  ListTablesCommand,
  DescribeTableCommand,
  AttributeValue,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  BatchWriteCommandOutput,
  DynamoDBDocumentClient,
  paginateScan,
} from "@aws-sdk/lib-dynamodb";
import assert from "node:assert";
import * as fs from "node:fs";
import path from "node:path";

import type { Seeder } from "@chehsunliu/seeder-js";

const maxWindowSize = 25;

export type DataSelector = {
  type: "dynamodb-json" | "json";
  getFilename: (tableName: string) => string;
};

type Props = {
  connection: {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  dataSelectors: DataSelector[];
};

type Metadata = {
  tables: TableInfo[];
};

type TableInfo = {
  tableName: string;
  primaryKey: string[];
};

export class DynamoDbSeeder implements Seeder {
  private readonly dataSelectors: DataSelector[];

  private readonly client: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;

  private metadata?: Metadata;

  constructor(props: Props) {
    this.dataSelectors = props.dataSelectors;

    this.client = new DynamoDBClient({
      region: props.connection.region,
      endpoint: props.connection.endpoint,
      credentials: {
        accessKeyId: props.connection.accessKeyId,
        secretAccessKey: props.connection.secretAccessKey,
      },
    });
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  truncate = async (): Promise<void> => {
    const metadata = await this.getMetadata();
    await Promise.all(metadata.tables.map(this.truncateTable));
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

        if (dataSelector.type === "dynamodb-json") {
          tasks.push(this.seedDynamoDbJsonData({ tableName: info.tableName, filepath }));
        } else if (dataSelector.type === "json") {
          tasks.push(this.seedRawJsonData({ tableName: info.tableName, filepath }));
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

    const r1 = await this.client.send(new ListTablesCommand());
    const tableNames = r1.TableNames ?? [];

    const tables: TableInfo[] = [];

    const rs2 = await Promise.all(tableNames.map((t) => this.client.send(new DescribeTableCommand({ TableName: t }))));
    for (const r of rs2) {
      if (r.Table === undefined) {
        continue;
      }

      assert.ok(r.Table.TableName);
      assert.ok(r.Table.KeySchema);

      tables.push({
        tableName: r.Table.TableName,
        primaryKey: r.Table.KeySchema.map((k) => {
          assert.ok(k.AttributeName);
          return k.AttributeName;
        }),
      });
    }

    return { tables };
  };

  private truncateTable = async (info: TableInfo): Promise<void> => {
    const paginator = paginateScan({ client: this.docClient }, { TableName: info.tableName });

    const allTasks: Array<Promise<BatchWriteCommandOutput>> = [];
    for await (const page of paginator) {
      if (page.Items === undefined) {
        continue;
      }

      const items = page.Items.map((item) => info.primaryKey.map((key) => [key, item[key]])).map(Object.fromEntries);

      const tasks: Array<Promise<BatchWriteCommandOutput>> = [];
      for (let i = 0; i < items.length; i += maxWindowSize) {
        const selectedItems = items.slice(i, i + maxWindowSize);
        const command = new BatchWriteCommand({
          RequestItems: {
            [info.tableName]: selectedItems.map((item) => ({ DeleteRequest: { Key: item } })),
          },
        });
        tasks.push(this.docClient.send(command));
      }

      allTasks.push(...tasks);
    }

    await Promise.all(allTasks);
  };

  private seedDynamoDbJsonData = async (args: { tableName: string; filepath: string }): Promise<void> => {
    const buffer = fs.readFileSync(args.filepath);
    const items = <Record<string, AttributeValue>[]>JSON.parse(buffer.toString());

    const tasks = [];
    for (let i = 0; i < items.length; i += maxWindowSize) {
      const selectedItems = items.slice(i, i + maxWindowSize);
      const command = new BatchWriteItemCommand({
        RequestItems: {
          [args.tableName]: selectedItems.map((item) => ({ PutRequest: { Item: item } })),
        },
      });
      tasks.push(this.client.send(command));
    }

    await Promise.all(tasks);
  };

  private seedRawJsonData = async (args: { tableName: string; filepath: string }): Promise<void> => {
    const buffer = fs.readFileSync(args.filepath);
    const items = <object[]>JSON.parse(buffer.toString());

    const tasks = [];
    for (let i = 0; i < items.length; i += maxWindowSize) {
      const selectedItems = items.slice(i, i + maxWindowSize);
      const command = new BatchWriteCommand({
        RequestItems: {
          [args.tableName]: selectedItems.map((item) => ({ PutRequest: { Item: item } })),
        },
      });
      tasks.push(this.docClient.send(command));
    }

    await Promise.all(tasks);
  };
}
