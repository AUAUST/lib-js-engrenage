import { spawn } from "node:child_process";

import { resolveBinary } from "#foundation/processes/index";
import { successMessage } from "#workflows/cli/constants";
import { loadValidatedConfig } from "#workflows/config/index";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

const forwardedSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

function runBinary(file: File, args: readonly string[]): Promise<number> {
  const child = spawn(process.execPath, [file, ...args], {
    stdio: "inherit",
  });

  function forward(signal: NodeJS.Signals) {
    child.kill(signal);
  }

  function stopForwarding() {
    for (const signal of forwardedSignals) {
      process.off(signal, forward);
    }
  }

  for (const signal of forwardedSignals) {
    process.on(signal, forward);
  }

  return new Promise((settle, fail) => {
    child.once("error", (error) => {
      stopForwarding();
      fail(error);
    });

    child.once("exit", (code, signal) => {
      stopForwarding();

      if (signal !== null) {
        process.kill(process.pid, signal);
      }

      // @debt The child is never killed when its caller gives up (a timed-out test), so it sets the global exit code later; with Vitest's shared workers that leaks into unrelated tests.
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
  const config = await loadValidatedConfig();

  const binaryPath = await resolveBinary(
    config.context.root,
    packageName,
    binary,
  );

  if (message !== undefined) {
    console.info(message);
  }

  const exitCode = await runBinary(binaryPath, args);

  if (message !== undefined && exitCode === 0) {
    console.info(successMessage);
  }
}
