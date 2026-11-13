import { dirname, join } from "node:path";

import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";

// @debt assumes the common directory sits in the main worktree, which fails for submodules and separated git directories
export async function resolveMainWorktree(root: Directory): Promise<Directory> {
  const output = await runGit(root, [
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
    "--show-prefix",
  ]);

  const [common = "", prefix = ""] = output.split("\n");

  return join(dirname(common), prefix);
}
