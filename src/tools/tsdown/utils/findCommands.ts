import { posix } from "node:path";

import { entries } from "@auaust/toolkit/object";

import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import {
  getExecutableFile,
  type ResolvedRoles,
} from "#project/structure/index";
import { toEntryName } from "#tools/tsdown/utils/toEntryName";
import type { ResolvedBin } from "#project/environments/index";
import type { File } from "#types/File";

export async function findCommands({
  bin,
  roles,
  filesystem,
}: {
  bin: ResolvedBin;
  roles: ResolvedRoles;
  filesystem: Filesystem;
}): Promise<(readonly [command: string, file: File])[]> {
  if (bin.entries !== undefined) {
    return Promise.all(
      entries(bin.entries).map(
        async ([command, file]): Promise<readonly [string, File]> => {
          if (!(await filesystem.exists(file))) {
            throw new Error(
              `Command '${command}' points to ${file}, which does not exist`,
            );
          }

          return [command, file];
        },
      ),
    );
  }

  const executableFile = getExecutableFile(roles);

  const files = await filesystem.glob(
    filesIn(
      bin.dirs,
      executableFile === undefined ? ["*.ts"] : ["*.ts", `*/${executableFile}`],
    ),
  );

  return files.map((file): readonly [string, File] => {
    return [posix.basename(toEntryName(file, executableFile)), file];
  });
}
