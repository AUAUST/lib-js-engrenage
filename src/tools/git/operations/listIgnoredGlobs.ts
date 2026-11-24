import { join, relative } from "node:path";

import { filterMap, map } from "@auaust/toolkit/array";

import {
  escapeGlob,
  pathExists,
  toPosixPath,
} from "#foundation/filesystem/index";
import { gitDirectory } from "#tools/git/constants";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

const ignoredStatus = "!! ";

/**
 * Lists, relative to `base`, the paths Git ignores within it, each escaped into
 * a glob matching only itself, a directory as a `<directory>/**` glob; nothing
 * outside a repository or for a base inside an ignored directory.
 */
export async function listIgnoredGlobs(
  repository: Directory,
  base: Directory,
): Promise<Globs> {
  if (!(await pathExists(join(repository, gitDirectory)))) {
    return [];
  }

  const located = toPosixPath(relative(repository, base));

  const output = await runGit(repository, [
    "status",
    "--porcelain",
    "-z",
    "--no-renames",
    "--ignored=matching",
    "--untracked-files=normal",
    "--",
    located || ".",
  ]);

  const prefix = located === "" ? "" : `${located}/`;

  const ignored = filterMap(
    output.split("\0"),
    (entry) => entry.startsWith(ignoredStatus),
    (entry) => entry.slice(ignoredStatus.length),
  );

  if (
    ignored.some((entry) => {
      return entry.endsWith("/") && prefix.startsWith(entry);
    })
  ) {
    return [];
  }

  return map(ignored, (entry) => {
    if (!entry.startsWith(prefix)) {
      throw new Error(
        `Git lists \`${entry}\` as ignored outside \`${located}\`.`,
      );
    }

    const glob = escapeGlob(entry.slice(prefix.length));

    return entry.endsWith("/") ? `${glob}**` : glob;
  });
}
