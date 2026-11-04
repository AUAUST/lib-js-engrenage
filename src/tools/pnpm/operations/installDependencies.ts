import { spawnProcess } from "#foundation/processes/operations/spawnProcess";
import type { Directory } from "#types/Directory";

// @debt repeats the spawn-and-check of invokeCommand in engrenage init instead of spawnProcess owning the check
export function installDependencies(root: Directory): void {
  const { status, error } = spawnProcess("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  });

  if (error !== undefined || status !== 0) {
    throw new Error("`pnpm install` failed", {
      cause: error,
    });
  }
}
