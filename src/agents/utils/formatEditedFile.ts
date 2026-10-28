import { spawnSync } from "node:child_process";

import { eslint, prettier } from "#constants";
import { defaultCacheLocation } from "#eslint/constants";
import { resolveBinary } from "#support/commander/utils/resolveBinary";
import { isWithin } from "#support/filesystem/utils/isWithin";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

const blockingExitCode = 2;

function runTool(
  config: ResolvedConfig,
  packageName: KnownPackageName,
  args: readonly string[],
) {
  const result = spawnSync(
    process.execPath,
    [resolveBinary(config, packageName, packageName), ...args],
    {
      cwd: config.root,
      encoding: "utf-8",
    },
  );

  if (result.error !== undefined) {
    throw new Error(`Cannot run ${packageName}`, {
      cause: result.error,
    });
  }

  return result;
}

export function formatEditedFile(config: ResolvedConfig, file: File) {
  if (!isWithin(config.root, file)) {
    return;
  }

  const { hasDependency } = config.environment;

  const hasEslint = hasDependency(eslint);

  const lintArgs = [
    "--no-warn-ignored",
    "--cache",
    "--cache-location",
    config.resolve(defaultCacheLocation),
    file,
  ];

  if (hasEslint) {
    runTool(config, eslint, ["--fix", ...lintArgs]);
  }

  if (hasDependency(prettier)) {
    const result = runTool(config, prettier, [
      "--write",
      "--ignore-unknown",
      file,
    ]);

    if (result.status !== 0) {
      process.stderr.write(result.stdout + result.stderr);
      process.exitCode = blockingExitCode;
    }
  }

  if (!hasEslint) {
    return;
  }

  const { status, stdout, stderr } = runTool(config, eslint, lintArgs);

  if (!(status !== 0)) {
    return;
  }

  process.stderr.write(stdout + stderr);
  process.exitCode = blockingExitCode;
}
