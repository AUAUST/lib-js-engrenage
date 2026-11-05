import { spawnProcess } from "#foundation/processes/index";
import type { Directory } from "#types/Directory";

// @debt repeats the spawn-and-check of invokeCommand in engrenage init instead of spawnProcess owning the check
export async function installDependencies(root: Directory): Promise<void> {
  const { status, error } = await spawnProcess("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  });

  if (error !== undefined || status !== 0) {
    throw new Error("`pnpm install` failed", {
      cause: error,
    });
  }
}
