import { runProcess } from "#foundation/processes/index";
import type { Directory } from "#types/Directory";

// @debt the install repoints every package `.engrenage/links.json` links back at its installed copy and leaves it so
export async function installDependencies(root: Directory): Promise<void> {
  await runProcess("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  });
}
