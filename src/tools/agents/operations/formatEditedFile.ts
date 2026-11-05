import { eslint } from "#constants";
import { isWithin } from "#foundation/filesystem/index";
import { resolveBinary, spawnProcess } from "#foundation/processes/index";
import { formatFile } from "#project/format/index";
import type { ConfigContext } from "#project/config/index";
import type { Formatter } from "#project/format/ports/Formatter";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";

const blockingExitCode = 2;

async function runTool(
  config: ConfigContext,
  packageName: KnownPackageName,
  args: readonly string[],
) {
  const root = await config.get("root");

  const result = spawnProcess(
    process.execPath,
    [resolveBinary(root, packageName, packageName), ...args],
    {
      cwd: root,
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

// @debt Each edit spawns ESLint twice (fix, then lint), and each process loads the project's ESLint config again; this takes most of the hook's time.
export async function formatEditedFile(
  config: ConfigContext,
  file: File,
  formatter: Formatter,
) {
  const root = await config.get("root");

  if (!isWithin(root, file)) {
    return;
  }

  const environment = await config.get("environment");

  const hasEslint = environment.hasDependency(eslint);

  const lintArgs = [
    "--no-warn-ignored",
    "--cache",
    "--cache-location",
    (await config.get("cacheFor"))(eslint),
    file,
  ];

  if (hasEslint) {
    await runTool(config, eslint, ["--fix", ...lintArgs]);
  }

  try {
    await formatFile(file, { root, formatter });
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );

    process.exitCode = blockingExitCode;
  }

  if (!hasEslint) {
    return;
  }

  const { status, stdout, stderr } = await runTool(config, eslint, lintArgs);

  if (!(status !== 0)) {
    return;
  }

  process.stderr.write(stdout + stderr);
  process.exitCode = blockingExitCode;
}
