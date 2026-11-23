import { isNonEmptyArray } from "@auaust/toolkit/array";

import type { Filesystem } from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function hasUnignoredFile({
  filesystem,
  ignored,
  dirs,
  files,
}: {
  filesystem: Filesystem;
  ignored: Globs;
  dirs: Directories;
  files: Globs;
}): Promise<boolean> {
  if (dirs.length === 0 && files.length === 0) {
    return false;
  }

  const skip = [
    ...ignored,
    ...ignored
      .filter((glob) => glob.endsWith("/**"))
      .map((glob) => glob.slice(0, -"/**".length)),
  ];

  for (const directory of dirs) {
    if (await filesystem.hasFile(directory, { skip })) {
      return true;
    }
  }

  return (
    files.length > 0 &&
    isNonEmptyArray(await filesystem.glob(files, { exclude: ignored }))
  );
}
