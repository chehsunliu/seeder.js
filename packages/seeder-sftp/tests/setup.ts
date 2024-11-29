import { afterAll } from "vitest";

import { seederManager } from "@chehsunliu/seeder";
import { SftpSeeder } from "@chehsunliu/seeder-sftp";

seederManager.configure([
  new SftpSeeder({
    connection: {
      host: "127.0.0.1",
      port: 2222,
      username: "foo",
      password: "bar",
    },
    localSrcDir: "sftp",
    sftpDestDir: "upload",
  }),
]);

afterAll(async () => {
  await seederManager.release();
});
