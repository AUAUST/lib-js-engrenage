import { spawn } from "node:child_process";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * Runs `file` with `args` in a Node process of the running Node, sharing
 * the terminal, in `cwd` when given; a signal ending it is raised again on
 * the running process.
 *
 * @returns The exit code, 1 when a signal ended it.
 * @throws {unknown} The reason of `signal` when it aborts the run, or
 * the spawn error.
 */
export function runNodeFile(
  file: File,
  args: readonly string[],
  { cwd, signal }: { cwd?: Directory; signal: AbortSignal },
): Promise<number> {
  const child = spawn(process.execPath, [file, ...args], {
    stdio: "inherit",
    signal,
    ...(cwd === undefined ? {} : { cwd }),
  });

  return new Promise((settle, fail) => {
    child.once("error", (error) => {
      if (!child.killed) {
        fail(error);
      }
    });

    child.once("exit", (code, exitSignal) => {
      if (signal.aborted) {
        return void fail(signal.reason);
      }

      if (exitSignal !== null) {
        process.kill(process.pid, exitSignal);
      }

      settle(code ?? 1);
    });
  });
}
