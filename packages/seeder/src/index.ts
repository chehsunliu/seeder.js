export interface Seeder {
  truncate(): Promise<void>;
  seed(folder: string): Promise<void>;
  release(): Promise<void>;
}

class SeederManager {
  private readonly seeders: Seeder[];

  constructor() {
    this.seeders = [];
  }

  configure = (seeders: Seeder[]) => {
    while (this.seeders.length > 0) {
      this.seeders.pop();
    }

    seeders.forEach((s) => this.seeders.push(s));
  };

  truncate = async () => {
    await Promise.all(this.seeders.map((s) => s.truncate()));
  };

  seed = async (folder: string) => {
    await Promise.all(this.seeders.map((s) => s.seed(folder)));
  };

  release = async () => {
    await Promise.all(this.seeders.map((s) => s.release()));
  };
}

export const seederManager = new SeederManager();
