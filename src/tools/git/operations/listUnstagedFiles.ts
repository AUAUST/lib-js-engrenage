import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

/**
 * The tracked files whose working tree content differs from the index, paths
 * relative to `root`.
 *
 * @throws {Error} When git fails.
 */
export async function listUnstagedFiles(root: Directory): Promise<Files> {
  const output = await runGit(root, [
    "diff",
    "--name-only",
    "--relative",
    "-z",
  ]);

  return output.split("\0").filter((path) => path !== "");
}
