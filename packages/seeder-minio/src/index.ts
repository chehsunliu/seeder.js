import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "node:fs";
import path from "node:path";

import { Seeder } from "@chehsunliu/seeder";

type Props = {
  connection: {
    region: string;
    endpoint: string;
    username: string;
    password: string;
  };
  localSrcDir: string;
  destBucket: string;
};

export class MinioSeeder implements Seeder {
  private readonly client: S3Client;
  private readonly props: Props;

  constructor(props: Props) {
    this.client = new S3Client({
      region: props.connection.region,
      endpoint: props.connection.endpoint,
      credentials: {
        accessKeyId: props.connection.username,
        secretAccessKey: props.connection.password,
      },
    });
    this.props = props;
  }

  truncate = async (): Promise<void> => {
    await this.deleteAllObjects();
  };

  seed = async (folder: string): Promise<void> => {
    const fullLocalSrcDir = path.join(folder, this.props.localSrcDir);
    if (!fs.existsSync(fullLocalSrcDir)) {
      return;
    }

    await this.uploadFiles(fullLocalSrcDir, fullLocalSrcDir);
  };

  release = async (): Promise<void> => {};

  private uploadFiles = async (rootFolder: string, folder: string): Promise<void> => {
    const items = fs.readdirSync(folder, { withFileTypes: true });

    for (const item of items) {
      const fullDataPath = path.join(folder, item.name);

      if (item.isDirectory()) {
        await this.uploadFiles(rootFolder, fullDataPath);
      } else {
        const relativeDataPath = fullDataPath.split(rootFolder)[1];
        const body = fs.readFileSync(fullDataPath);
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.props.destBucket,
            Key: relativeDataPath,
            Body: body,
          }),
        );
      }
    }
  };

  private deleteAllObjects = async (): Promise<void> => {
    const { Contents: items } = await this.client.send(new ListObjectsV2Command({ Bucket: this.props.destBucket }));
    if (items === undefined) {
      return;
    }

    const tasks = items.map((item) =>
      this.client.send(new DeleteObjectCommand({ Bucket: this.props.destBucket, Key: item.Key })),
    );
    await Promise.all(tasks);
  };
}
