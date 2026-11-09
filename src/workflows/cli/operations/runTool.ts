import { spawn } from "node:child_process";

import { successMessage } from "#constants";
import { resolveBinary } from "#foundation/processes/index";
import { runContext } from "#workflows/cli/operations/runContext";
import { loadValidatedConfig } from "#workflows/config/index";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

function runBinary(
  file: File,
  args: readonly string[],
  signal: AbortSignal,
): Promise<number> {
  const child = spawn(process.execPath, [file, ...args], {
    stdio: "inherit",
    signal,
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

      process.exitCode = code ?? 1;
      settle(process.exitCode);
    });
  });
}

export async function runTool(
  {
    packageName,
    binary,
    message,
  }: {
    packageName: KnownPackageName;
    binary: string;
    message: string | undefined;
  },
  args: readonly string[],
): Promise<void> {
  const context = runContext.getStore();

  if (context === undefined) {
    throw new Error("Tool commands run only within runProgram");
  }

  const config = await loadValidatedConfig();

  const binaryPath = await resolveBinary(
    config.context.root,
    packageName,
    binary,
  );

  if (message !== undefined) {
    console.info(message);
  }

  const exitCode = await runBinary(binaryPath, args, context.signal);

  if (message !== undefined && exitCode === 0) {
    console.info(successMessage);
  }
}
