import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
import { withTemporaryIndex } from "#tools/git/operations/withTemporaryIndex";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

async function hashIndex(
  root: Directory,
  env?: Record<string, string>,
): Promise<string> {
  const output = await runGit(root, ["write-tree"], env);

  return output.trim();
}

async function unstage(
  root: Directory,
  paths: Files,
  env: Record<string, string>,
): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  const args = (await readHead(root)) === undefined
    ? ["rm", "--cached", "-q", "--ignore-unmatch", "--", ...paths]
    : ["reset", "-q", "HEAD", "--", ...paths];

  await runGit(root, args, env);
}

/**
 * The tree hash of `selection`: the index in `staged` mode, the worktree without
 * its `exclude` files in `worktree` mode, plus in both the `include` files Git
 * ignores, as they are on disk.
 *
 * @throws {Error} When git fails.
 */
export async function hashTree(
  root: Directory,
  selection:
    | { mode: "staged"; include?: Files }
    | { mode: "worktree"; exclude?: Files; include?: Files },
): Promise<string> {
  const include = selection.include ?? [];

  if (selection.mode === "staged" && include.length === 0) {
    return hashIndex(root);
  }

  return withTemporaryIndex(root, async (env) => {
    if (selection.mode === "worktree") {
      await runGit(root, ["add", "-A"], env);

      await unstage(root, selection.exclude ?? [], env);
    }

    if (include.length > 0) {
      await runGit(root, ["add", "-f", "--", ...include], env);
    }

    return hashIndex(root, env);
  });
}
