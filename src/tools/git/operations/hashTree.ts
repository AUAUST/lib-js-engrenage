import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { isMissingError, resolve } from "#foundation/filesystem/index";
import { readHead } from "#tools/git/operations/readHead";
import { runGit } from "#tools/git/operations/runGit";
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

export async function hashTree(
  root: Directory,
  selection: { mode: "staged" } | { mode: "worktree"; exclude?: Files },
): Promise<string> {
  if (selection.mode === "staged") {
    return hashIndex(root);
  }

  const directory = await mkdtemp(join(tmpdir(), "engrenage-index-"));

  try {
    const index = join(directory, "index");

    const indexPath = await runGit(root, ["rev-parse", "--git-path", "index"]);

    const source = resolve(root, indexPath.trim());

    try {
      await cp(source, index, { preserveTimestamps: true });
    } catch (error) {
      if (!isMissingError(error)) {
        throw error;
      }
    }

    const env = { GIT_INDEX_FILE: index };

    await runGit(root, ["add", "-A"], env);

    await unstage(root, selection.exclude ?? [], env);

    return await hashIndex(root, env);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
