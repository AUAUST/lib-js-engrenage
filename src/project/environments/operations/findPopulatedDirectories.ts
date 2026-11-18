import { matchesGlob } from "node:path";

import { findDirectories } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";

export async function findPopulatedDirectories(
  config: ConfigResolver,
  directories: Directories,
): Promise<Directories> {
  const { filesystem } = config.context;

  const existing = await findDirectories(filesystem, directories);

  if (existing.length === 0) {
    return [];
  }

  const git = await config.resolve("git");

  const ignored = await git.ignored;

  const skip = [
    ...ignored,
    ...ignored
      .filter((glob) => glob.endsWith("/**"))
      .map((glob) => glob.slice(0, -"/**".length)),
  ];

  const populated = await Promise.all(
    existing.map(async (directory) => {
      const files = await filesystem.list(directory, { skip });

      return files.some((file) => {
        return !ignored.some((glob) => matchesGlob(file, glob));
      });
    }),
  );

  return existing.filter((_, index) => populated[index]);
}
