import { eslint } from "#constants";
import { isWithin } from "#foundation/filesystem/utils/isWithin";
import { resolveBinary } from "#foundation/processes/operations/resolveBinary";
import { spawnProcess } from "#foundation/processes/operations/spawnProcess";
import { formatFile } from "#project/format/operations/formatFile";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Formatter } from "#project/format/ports/Formatter";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

const blockingExitCode = 2;

function runTool(
  config: ProjectConfig,
  packageName: KnownPackageName,
  args: readonly string[],
) {
  const result = spawnProcess(
    process.execPath,
    [resolveBinary(config.root, packageName, packageName), ...args],
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

export async function formatEditedFile(
  config: ProjectConfig,
  file: File,
  formatter: Formatter,
) {
  if (!isWithin(config.root, file)) {
    return;
  }

  const hasEslint = config.environment.hasDependency(eslint);

  const lintArgs = [
    "--no-warn-ignored",
    "--cache",
    "--cache-location",
    config.cacheFor(eslint),
    file,
  ];

  if (hasEslint) {
    runTool(config, eslint, ["--fix", ...lintArgs]);
  }

  try {
    await formatFile(file, { root: config.root, formatter });
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );

    process.exitCode = blockingExitCode;
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
