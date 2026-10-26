import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname } from "node:path";

import { wrap } from "@auaust/primitive-kit/arrays";
import { isString } from "@auaust/toolkit/isString";
import { get } from "@auaust/toolkit/object";
import { transformValues } from "@auaust/toolkit/transformValues";

import { loadConfig } from "#config/utils/loadConfig";
import { packageJsonFile } from "#constants";
import { resolve } from "#support/filesystem/utils/resolve";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { CommandDefinition } from "#support/commander/types/CommandDefinition";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

const forwardedSignals = ["SIGHUP", "SIGINT", "SIGTERM"] as const;

function isModuleNotFound(error: unknown): boolean {
  return error instanceof Error && get(error, "code") === "MODULE_NOT_FOUND";
}

function resolveManifest(
  config: ResolvedConfig,
  packageName: KnownPackageName,
): File {
  const require = createRequire(config.resolve(packageJsonFile));

  try {
    return require.resolve(`${packageName}/${packageJsonFile}`);
  } catch (error) {
    if (!isModuleNotFound(error)) {
      throw error;
    }

    throw new Error(`Install ${packageName} in ${config.root} to run it`, {
      cause: error,
    });
  }
}

function resolveBinary(
  config: ResolvedConfig,
  packageName: KnownPackageName,
  binary: string,
): File {
  const manifestPath = resolveManifest(config, packageName);

  const directory = dirname(manifestPath);

  const { bin } = createPackageJson({
    root: directory,
    path: manifestPath,
  });

  const path = isString(bin) ? bin : bin[binary];

  if (path === undefined) {
    throw new Error(`${manifestPath} declares no "${binary}" binary`);
  }

  return resolve(directory, path);
}

function runBinary(file: File, args: readonly string[]): Promise<void> {
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
      settle();
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

          await runBinary(
            resolveBinary(config, packageName, binary),
            transformed,
          );
        });
    };
  });
}
