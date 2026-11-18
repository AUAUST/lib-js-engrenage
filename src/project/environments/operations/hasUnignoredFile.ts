import { isNonEmptyArray } from "@auaust/toolkit/array";

import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function hasUnignoredFile(
  config: ConfigResolver,
  { dirs, files = [] }: { dirs: Directories; files?: Globs },
): Promise<boolean> {
  if (dirs.length === 0 && files.length === 0) {
    return false;
  }

  const { filesystem } = config.context;

  const git = await config.resolve("git");

  // @debt `git.ignored` reruns `git status` on each read, so every environment resolution and `listMappedEnvironments` spawns its own; a value read once per load would serve them all

  const ignored = await git.ignored;

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
