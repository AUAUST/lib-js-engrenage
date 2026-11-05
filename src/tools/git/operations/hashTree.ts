import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { isMissingError, resolve } from "#foundation/filesystem/index";
import { runGit } from "#tools/git/operations/runGit";
import type { ChangeMode } from "#tools/git/types/ChangeMode";
import type { Directory } from "#types/Directory";

async function hashIndex(
  root: Directory,
  env?: Record<string, string>,
): Promise<string> {
  const output = await runGit(root, ["write-tree"], env);

  return output.trim();
}

export async function hashTree(
  root: Directory,
  mode: ChangeMode,
): Promise<string> {
  if (mode === "staged") {
    return hashIndex(root);
  }

  const directory = await mkdtemp(join(tmpdir(), "engrenage-index-"));

  try {
    const index = join(directory, "index");

    const indexPath = await runGit(root, ["rev-parse", "--git-path", "index"]);

    const source = resolve(root, indexPath.trim());

    try {
      await copyFile(source, index);
    } catch (error) {
      if (!isMissingError(error)) {
        throw error;
      }
    }

    const env = { GIT_INDEX_FILE: index };

    await runGit(root, ["add", "-A"], env);

    return await hashIndex(root, env);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
