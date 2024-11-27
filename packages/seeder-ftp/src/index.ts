import { Client } from "basic-ftp";
import * as fs from "node:fs";
import path from "node:path";

import { Seeder } from "@chehsunliu/seeder";

type Props = {
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  localSrcDir: string;
  ftpDestDir: string;
};

export class FtpSeeder implements Seeder {
  private readonly props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  truncate = async (): Promise<void> => {
    const client = await this.createClient();
    try {
      await client.ensureDir(this.props.ftpDestDir);
      await client.clearWorkingDir();
    } finally {
      client.close();
    }
  };

  seed = async (folder: string): Promise<void> => {
    const fullLocalSrcDir = path.join(folder, this.props.localSrcDir);
    if (!fs.existsSync(fullLocalSrcDir)) {
      return;
    }

    const client = await this.createClient();
    try {
      await client.uploadFromDir(fullLocalSrcDir, this.props.ftpDestDir);
    } finally {
      client.close();
    }
  };

  release = async (): Promise<void> => {};

  /**
   * The FTP protocol does not allow multiple requests on a single connection.
   * Create new clients for every request instead of reuse.
   */
  private createClient = async (): Promise<Client> => {
    const client = new Client();
    await client.access(this.props.connection);
    return client;
  };
}
