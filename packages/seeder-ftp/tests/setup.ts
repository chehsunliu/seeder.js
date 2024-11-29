import { afterAll } from "vitest";

import { seederManager } from "@chehsunliu/seeder";
import { FtpSeeder } from "@chehsunliu/seeder-ftp";

seederManager.configure([
  new FtpSeeder({
    connection: {
      host: "127.0.0.1",
      port: 2121,
      user: "foo",
      password: "BC499D13-EB4B-4EAE-994D-7435364654C5",
    },
    localSrcDir: "ftp",
    ftpDestDir: "/ftp/foo/a",
  }),
]);

afterAll(async () => {
  await seederManager.release();
});
