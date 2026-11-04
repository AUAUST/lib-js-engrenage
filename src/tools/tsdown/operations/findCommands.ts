import { posix } from "node:path";

import { entries } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/utils/filesIn";
import { binEntryFiles } from "#tools/tsdown/constants";
import { toEntryName } from "#tools/tsdown/utils/toEntryName";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedBin } from "#project/environments/types/ResolvedBin";
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

  return filesystem
    .glob(filesIn(bin.dirs, binEntryFiles))
    .map((file): readonly [string, File] => {
      return [posix.basename(toEntryName(file)), file];
    });
}
