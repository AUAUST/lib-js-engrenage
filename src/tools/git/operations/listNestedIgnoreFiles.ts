import { join } from "node:path";

import { filterMap, map, sort } from "@auaust/toolkit/array";

import { gitignoreFile } from "#constants";
import { pathExists, resolveWithin } from "#foundation/filesystem/index";
import { gitDirectory } from "#tools/git/constants";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

const ignoredStatus = "!! ";

const nestedIgnoreFiles = `:(glob)*/**/${gitignoreFile}`;

/**
 * The ignore files below `base`, its own excluded, that Git reads: those
 * outside ignored directories, an ignore file ignoring itself included; none
 * outside a repository.
 */
export async function listNestedIgnoreFiles(
  repository: Directory,
  base: Directory,
): Promise<Files> {
  if (!(await pathExists(join(repository, gitDirectory)))) {
    return [];
  }

  const [listed, status] = await Promise.all([
    runGit(base, [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--deduplicate",
      "--",
      nestedIgnoreFiles,
    ]),
    runGit(base, [
      "status",
      "--porcelain",
      "-z",
      "--no-renames",
      "--ignored=matching",
      "--untracked-files=all",
      "--",
      nestedIgnoreFiles,
    ]),
  ]);

  const selfIgnored = filterMap(
    status.split("\0"),
    (entry) => {
      return (
        entry.startsWith(ignoredStatus) && entry.endsWith(`/${gitignoreFile}`)
      );
    },
    (entry) => resolveWithin(repository, entry.slice(ignoredStatus.length)),
  );

  const read = map(
    listed.split("\0").filter((file) => file !== ""),
    (file) => resolveWithin(base, file),
  );

  return sort([...read, ...selfIgnored]);
}
