import { runProcess } from "#foundation/processes/index";
import type { Directory } from "#types/Directory";

export async function installDependencies(root: Directory): Promise<void> {
  await runProcess("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  });
}
