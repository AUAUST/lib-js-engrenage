import { spawn } from "node:child_process";

import { wrap } from "@auaust/primitive-kit/arrays";
import { transformValues } from "@auaust/toolkit/transformValues";

import { loadConfig } from "#config/utils/loadConfig";
import { successMessage } from "#support/commander/constants";
import { resolveBinary } from "#support/commander/utils/resolveBinary";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { CommandDefinition } from "#support/commander/types/CommandDefinition";
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
      description: string;
      message?: string;
      aliases?: readonly string[] | string;
      arguments?: (
        config: ResolvedConfig,
        args: string[],
      ) => readonly string[] | undefined;
    }
  >;
}): Record<Name, CommandDefinition> {
  return transformValues(commands, function (tool): CommandDefinition {
    return (command) => {
      return command
        .description(tool.description)
        .aliases(wrap(tool.aliases))
        .helpOption(false)
        .passThroughOptions()
        .allowUnknownOption()
        .allowExcessArguments()
        .action(async (_options, { args: rawArgs }) => {
          const config = await loadConfig();

          const args = [...rawArgs];

          const transformed = tool.arguments?.(config, args) ?? args;

          const binaryPath = resolveBinary(config, packageName, binary);

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
