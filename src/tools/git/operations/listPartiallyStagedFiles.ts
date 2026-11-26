import { listChangedFiles } from "#tools/git/operations/listChangedFiles";
import { listUnstagedFiles } from "#tools/git/operations/listUnstagedFiles";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

export async function listPartiallyStagedFiles(
  root: Directory,
): Promise<Files> {
  const [staged, unstaged] = await Promise.all([
    listChangedFiles(root, "staged"),
    listUnstagedFiles(root),
  ]);

  const modified = new Set(unstaged);

  return staged.filter((file) => modified.has(file));
}
