import { join, relative } from "node:path";

import { filterMap, map } from "@auaust/primitive-kit/arrays";

import {
  isWithin,
  pathExists,
  toPosixPath,
} from "#foundation/filesystem/index";
import { gitDirectory } from "#tools/git/constants";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

const ignoredStatus = "!! ";

export async function listIgnoredGlobs(
  repository: Directory,
  base: Directory,
): Promise<Globs> {
  if (!(await pathExists(join(repository, gitDirectory)))) {
    return [];
  }

  const output = await runGit(repository, [
    "status",
    "--porcelain",
    "-z",
    "--no-renames",
    "--ignored=matching",
    "--untracked-files=normal",
    "--",
    toPosixPath(relative(repository, base)) || ".",
  ]);

  const ignored = filterMap(
    output.split("\0"),
    (entry) => entry.startsWith(ignoredStatus),
    (entry) => entry.slice(ignoredStatus.length),
  );

  if (ignored.some((entry) => isWithin(join(repository, entry), base))) {
    return [];
  }

  // @debt each path becomes a glob unescaped, so a path holding glob syntax matches more than itself
  return map(ignored, (entry) => {
    const glob = toPosixPath(relative(base, join(repository, entry)));

    return entry.endsWith("/") ? `${glob}/**` : glob;
  });
}
