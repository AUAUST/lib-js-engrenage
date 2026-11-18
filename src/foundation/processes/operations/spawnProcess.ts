import { spawn, type SpawnOptions } from "node:child_process";

import { get } from "@auaust/toolkit/object";

import type { ProcessResult } from "#foundation/processes/types/ProcessResult";

export function spawnProcess(
  command: string,
  args: readonly string[],
  {
    input,
    ...options
  }: Pick<SpawnOptions, "cwd" | "env" | "signal" | "stdio"> & {
    /**
     * Text written to the process's stdin, which `stdio` must leave piped.
     */
    input?: string;
  },
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);

    let stdout = "";
    let stderr = "";

    child.stdout?.setEncoding("utf-8").on("data", (chunk: string) => {
      stdout += chunk;
    });

    child.stderr?.setEncoding("utf-8").on("data", (chunk: string) => {
      stderr += chunk;
    });

    child.once("error", (error) => {
      resolve({
        status: null,
        signal: null,
        stdout,
        stderr,
        error,
      });
    });

    child.once("close", (status, signal) => {
      resolve({
        status,
        signal,
        stdout,
        stderr,
        error: undefined,
      });
    });

    if (input === undefined) {
      return;
    }

    if (child.stdin === null) {
      child.kill();

      throw new Error(
        `Cannot write input to ${command}: its stdin is not piped`,
      );
    }

    child.stdin.on("error", (error) => {
      if (get(error, "code") !== "EPIPE") {
        throw error;
      }
    });

    child.stdin.end(input);
  });
}
