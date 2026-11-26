import { runGit } from "#tools/git/operations/runGit";
import type { ChangeMode } from "#tools/git/types/ChangeMode";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

/**
 * The files `mode`'s changes delete or rename away, under their `HEAD` paths
 * relative to `root`.
 *
 * @throws {Error} When git fails.
 */
export async function listRemovedFiles(
  root: Directory,
  mode: ChangeMode,
): Promise<Files> {
  const output = await runGit(root, [
    "diff",
    ...(mode === "staged" ? ["--cached"] : ["HEAD"]),
    "--name-only",
    "--relative",
    "--no-renames",
    "--diff-filter=D",
    "-z",
  ]);

  return output.split("\0").filter((path) => path !== "");
}
