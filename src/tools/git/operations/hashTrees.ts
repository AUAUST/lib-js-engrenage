import { intersection } from "@auaust/toolkit/array";

import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
import { withTemporaryIndex } from "#tools/git/operations/withTemporaryIndex";
import type { ChangeMode } from "#tools/git/types/ChangeMode";
import type { TreeHashes } from "#tools/git/types/TreeHashes";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

async function hashIndex(
  root: Directory,
  env?: Record<string, string>,
): Promise<string> {
  const output = await runGit(root, ["write-tree"], env);

  return output.trim();
}

async function hashStaged(
  root: Directory,
  include: Files,
  env: Record<string, string>,
): Promise<string> {
  await stage(root, include, env);

  return hashIndex(root, env);
}

async function isBorn(root: Directory): Promise<boolean> {
  return (await readHead(root)) !== undefined;
}

async function stage(
  root: Directory,
  paths: Files,
  env: Record<string, string>,
): Promise<void> {
  if (paths.length > 0) {
    await runGit(root, ["add", "-f", "--", ...paths], env);
  }
}

async function unstage(
  root: Directory,
  paths: Files,
  born: boolean,
  env: Record<string, string>,
): Promise<void> {
  const args = born
    ? ["reset", "-q", "HEAD", "--", ...paths]
    : ["rm", "--cached", "-q", "--ignore-unmatch", "--", ...paths];

  await runGit(root, args, env);
}

/**
 * From one temporary index, the tree hash of the `mode` selection, the index in
 * `staged` mode or the worktree in `worktree` mode, and that of the worktree
 * without its `exclude` files, both plus the `include` files Git ignores,
 * as they are on disk.
 *
 * @throws {Error} When git fails.
 */
export async function hashTrees(
  root: Directory,
  {
    mode,
    exclude = [],
    include = [],
  }: { mode: ChangeMode; exclude?: Files; include?: Files },
): Promise<TreeHashes> {
  return withTemporaryIndex(root, async (env) => {
    const stagedWithInclude = mode === "staged" && include.length > 0
      ? await hashStaged(root, include, env)
      : undefined;

    const [staged, born] = await Promise.all([
      mode === "staged" && include.length === 0
        ? hashIndex(root)
        : stagedWithInclude,
      exclude.length === 0 ? false : isBorn(root),
      runGit(root, ["add", "-A"], env),
    ]);

    await stage(root, include, env);

    const worktree = await hashIndex(root, env);

    const selected = staged ?? worktree;

    if (exclude.length === 0) {
      return { selected, worktree };
    }

    await unstage(root, exclude, born, env);

    await stage(root, intersection(include, exclude), env);

    return { selected, worktree: await hashIndex(root, env) };
  });
}
