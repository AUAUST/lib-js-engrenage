import { posix } from "node:path";

import { entries } from "@auaust/toolkit/object";

import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import { getIndexFile } from "#project/structure/index";
import { toEntryName } from "#tools/tsdown/utils/toEntryName";
import type { ResolvedBin } from "#project/environments/index";
import type { File } from "#types/File";

export function findCommands({
  bin,
  filesystem,
}: {
  bin: ResolvedBin;
  filesystem: Filesystem;
}): (readonly [command: string, file: File])[] {
  if (bin.commands !== undefined) {
    return entries(bin.commands).map(([command, file]) => {
      if (!filesystem.exists(file)) {
        throw new Error(
          `Command '${command}' points to ${file}, which does not exist`,
        );
      }

      return [command, file];
    });
  }

  const indexFile = getIndexFile(bin.roles);

  return filesystem
    .glob(filesIn(bin.dirs, ["*.ts", `*/${indexFile}`]))
    .map((file): readonly [string, File] => {
      return [posix.basename(toEntryName(file, indexFile)), file];
    });
}
