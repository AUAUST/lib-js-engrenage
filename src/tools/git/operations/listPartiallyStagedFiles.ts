import { listChangedFiles } from "#tools/git/operations/listChangedFiles";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

export async function listPartiallyStagedFiles(
  root: Directory,
): Promise<Files> {
  const [staged, unstaged] = await Promise.all([
    listChangedFiles(root, "staged"),
    runGit(root, ["diff", "--name-only", "--relative", "-z"]),
  ]);

  const modified = new Set(unstaged.split("\0"));

  return staged.filter((file) => modified.has(file));
}
