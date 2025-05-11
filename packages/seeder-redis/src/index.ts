import { createClient, RedisClientType, REDIS_FLUSH_MODES } from "@redis/client";

import { Seeder } from "@chehsunliu/seeder";

type Props = {
  url: string;
};

export class RedisSeeder implements Seeder {
  private readonly props: Props;
  private client?: RedisClientType;

  constructor(props: Props) {
    this.props = props;
  }

  truncate = async (): Promise<void> => {
    const client = await this.getClient();
    await client.flushAll(REDIS_FLUSH_MODES.SYNC);
  };

  seed = async (): Promise<void> => {};

  release = async (): Promise<void> => {
    if (this.client === undefined) {
      return;
    }

    const tmp = this.client;
    this.client = undefined;
    await tmp.disconnect();
  };

  private getClient = async (): Promise<RedisClientType> => {
    if (this.client !== undefined) {
      return this.client;
    }

    this.client = createClient({ url: this.props.url });
    await this.client.connect();
    return this.client;
  };
}
