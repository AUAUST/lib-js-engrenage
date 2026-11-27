import { relative } from "node:path";

import { successMessage } from "#constants";
import { pathExists, resolve, toPosixPath } from "#foundation/filesystem/index";
import { resolveBinary, runNodeFile } from "#foundation/processes/index";
import { getRunContext } from "#nexus/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";
import type { Directory } from "#types/Directory";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { ToolAction } from "#workflows/cli/types/ToolAction";
import type { ToolRuns } from "#workflows/cli/types/ToolRuns";

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

  const resolved:
    | readonly string[]
    | ToolRuns = action === undefined ? rebased : await action(rebased, config);

  const runs = "runs" in resolved ? resolved.runs : [resolved];

  const binaryPath = await resolveBinary(projectRoot, packageName, binary);

  if (message !== undefined) {
    reporter.info(message);
  }

  // @debt concurrent runs share the terminal, so their diagnostics interleave with no label naming the run that reported them, and nothing bounds how many run at once
  const exitCodes = await Promise.all(
    runs.map((runArgs) => {
      return runNodeFile(binaryPath, runArgs, {
        ...(root && { cwd: projectRoot }),
        signal,
      });
    }),
  );

  process.exitCode = exitCodes.find((code) => code !== 0) ?? 0;

  if (message !== undefined && process.exitCode === 0) {
    reporter.info(successMessage);
  }
}
