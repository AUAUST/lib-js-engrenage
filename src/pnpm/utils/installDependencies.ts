import { spawnSync } from "node:child_process";

import type { Directory } from "#types/Directory";

// @debt repeats the spawn-and-check of invokeCommand in engrenage init instead of sharing one subprocess helper
export function installDependencies(root: Directory): void {
  const { status, error } = spawnSync("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  });

  if (error !== undefined || status !== 0) {
    throw new Error("`pnpm install` failed", {
      cause: error,
    });
  }
}
