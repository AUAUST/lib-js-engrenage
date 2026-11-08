import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { relativeWithin, resolveWithin } from "#foundation/filesystem/index";
import { runGit } from "#tools/git/operations/runGit";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";
import type { Globs } from "#types/Globs";

export async function listLocalFiles(
  git: ResolvedGit,
  base: Directory,
  globs: Globs,
  files: Files,
): Promise<Files> {
  if (files.length === 0 || globs.length === 0) {
    return [];
  }

  const directory = relativeWithin(git.root, base);

  const patterns =
    base === git.root
      ? globs
      : map(globs, (glob) => {
          const negative = glob.startsWith("!");
          const pattern = negative ? glob.slice(1) : glob;
          const prefix = negative ? "!" : "";

          return pattern.slice(0, -1).includes("/")
            ? `${prefix}/${directory}/${pattern.replace(/^\//u, "")}`
            : `${prefix}/${directory}/**/${pattern}`;
        });

  const paths = map(files, (file) =>
    relativeWithin(git.root, resolveWithin(base, file)),
  );

  const output = await runGit(git.root, [
    "ls-files",
    "--cached",
    "--others",
    "--ignored",
    "-z",
    ...flatMap(patterns, (pattern) => ["-x", pattern]),
    "--",
    ...paths,
  ]);

  return map(
    output.split("\0").filter((file) => file !== ""),
    (file) => relativeWithin(base, resolveWithin(git.root, file)),
  );
}
