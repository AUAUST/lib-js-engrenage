import { spawn } from "node:child_process";
import { relative } from "node:path";

import { successMessage } from "#constants";
import { pathExists, resolve, toPosixPath } from "#foundation/filesystem/index";
import { resolveBinary } from "#foundation/processes/index";
import { getRunContext } from "#workflows/cli/operations/getRunContext";
import { loadValidatedConfig } from "#workflows/config/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { ToolAction } from "#workflows/cli/types/ToolAction";

// @debt a glob given from a subdirectory is passed unchanged, so it still matches relative to the root
async function rebasePaths(
  args: readonly string[],
  root: Directory,
): Promise<string[]> {
  const cwd = process.cwd();

  return Promise.all(
    args.map(async (arg) => {
      if (arg.startsWith("-")) {
        return arg;
      }

      const path = resolve(cwd, arg);

      if (!(await pathExists(path))) {
        return arg;
      }

      return toPosixPath(relative(root, path)) || ".";
    }),
  );
}

function runBinary(
  file: File,
  args: readonly string[],
  cwd: Directory | undefined,
  signal: AbortSignal,
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
    root,
    action,
  }: {
    packageName: KnownPackageName;
    binary: string;
    message: string | undefined;
    root: boolean;
    action: ToolAction | undefined;
  },
  args: string[],
): Promise<void> {
  const { signal, reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const projectRoot = config.context.root;

  const rebased = root ? await rebasePaths(args, projectRoot) : args;

  const resolved = action === undefined
    ? rebased
    : await action(rebased, config);

  if (resolved === undefined) {
    return;
  }

  const binaryPath = await resolveBinary(projectRoot, packageName, binary);

  if (message !== undefined) {
    reporter.info(message);
  }

  const exitCode = await runBinary(
    binaryPath,
    resolved,
    root ? projectRoot : undefined,
    signal,
  );

  if (message !== undefined && exitCode === 0) {
    reporter.info(successMessage);
  }
}
