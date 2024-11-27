import * as fs from "node:fs";
import path from "node:path";
import SftpClient from "ssh2-sftp-client";

import { Seeder } from "@chehsunliu/seeder";

type Props = {
  connection: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  localSrcDir: string;
  sftpDestDir: string;
};

export class SftpSeeder implements Seeder {
  private readonly props: Props;
  private client?: SftpClient;

  constructor(props: Props) {
    this.props = props;
  }

  truncate = async (): Promise<void> => {
    await this.rmDir(this.props.sftpDestDir);
  };

  seed = async (folder: string): Promise<void> => {
    const fullLocalSrcDir = path.join(folder, this.props.localSrcDir);
    if (!fs.existsSync(fullLocalSrcDir)) {
      return;
    }

    const client = await this.getClient();
    await client.uploadDir(fullLocalSrcDir, this.props.sftpDestDir);
  };

  release = async (): Promise<void> => {
    if (this.client === undefined) {
      return;
    }

    const tmpClient = this.client;
    this.client = undefined;
    await tmpClient.end();
  };

  private getClient = async (): Promise<SftpClient> => {
    if (this.client !== undefined) {
      return this.client;
    }

    this.client = new SftpClient();
    await this.client.connect(this.props.connection);
    return this.client;
  };

  private rmDir = async (folder: string): Promise<void> => {
    const client = await this.getClient();

    for (const f of await client.list(folder)) {
      const fullPath = path.join(folder, f.name);
      if (f.type === "d") {
        await this.rmDir(fullPath);
        await client.rmdir(fullPath);
      } else {
        await client.delete(fullPath);
      }
    }
  };
}
