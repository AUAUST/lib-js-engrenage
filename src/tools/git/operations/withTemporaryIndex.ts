import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { isMissingError, resolve } from "#foundation/filesystem/index";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";

/**
 * Runs `use` with the environment pointing git at a copy of the index of the
 * repository at `root`, deleted once `use` settles, so staging there leaves
 * the index untouched.
 *
 * @throws {Error} When git fails.
 */
export async function withTemporaryIndex<Result>(
  root: Directory,
  use: (env: Record<string, string>) => Promise<Result>,
): Promise<Result> {
  const directory = await mkdtemp(join(tmpdir(), "engrenage-index-"));

  try {
    const index = join(directory, "index");

    const indexPath = await runGit(root, ["rev-parse", "--git-path", "index"]);

    try {
      await cp(resolve(root, indexPath.trim()), index, {
        preserveTimestamps: true,
      });
    } catch (error) {
      if (!isMissingError(error)) {
        throw error;
      }
    }

    return await use({ GIT_INDEX_FILE: index });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
