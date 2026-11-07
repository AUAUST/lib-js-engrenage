import { spawn } from "node:child_process";

import { transformValues } from "@auaust/toolkit/transformValues";

import { resolveBinary } from "#foundation/processes/index";
import { loadConfig, type LoadedConfig } from "#project/config/index";
import { successMessage } from "#workflows/cli/constants";
import { validateConfig } from "#workflows/config/index";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

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

export function defineToolCommands<Name extends string>({
  packageName,
  binary = packageName,
  commands,
}: {
  packageName: KnownPackageName;
  binary?: string;
  commands: Record<
    Name,
    {
      message?: string;
      arguments?(
        config: LoadedConfig,
        args: string[],
      ): readonly string[] | undefined | Promise<readonly string[] | undefined>;
    }
  >;
}): Record<Name, CommandDefinition> {
  return transformValues(commands, function (tool): CommandDefinition {
    return (command) => {
      return command
        .helpOption(false)
        .passThroughOptions()
        .allowUnknownOption()
        .allowExcessArguments()
        .action(async (_options, { args: rawArgs }) => {
          const config = validateConfig(await loadConfig());

          const args = [...rawArgs];

          const transformed = (await tool.arguments?.(config, args)) ?? args;

          const binaryPath = await resolveBinary(
            config.context.root,
            packageName,
            binary,
          );

          if (tool.message !== undefined) {
            console.info(tool.message);
          }

          const exitCode = await runBinary(binaryPath, transformed);

          if (tool.message !== undefined && exitCode === 0) {
            console.info(successMessage);
          }
        });
    };
  });
}
