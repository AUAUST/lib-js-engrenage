import { runProcess } from "#foundation/processes/index";
import { restoreLinks } from "#tools/pnpm/operations/restoreLinks";
import type { Directory } from "#types/Directory";

/**
 * Installs the dependencies of `root`, then restores the links the install
 * replaced, as its synced `prepare` script would.
 */
export async function installDependencies(root: Directory): Promise<void> {
  await runProcess("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  });

  await restoreLinks(root);
}
