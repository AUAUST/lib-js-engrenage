import { iterable } from "@auaust/toolkit";

import { ensureIncludes } from "#foundation/processes/index";
import { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
import type { LoadedConfig } from "#project/config/index";

/**
 * Passes jscpd each scanned file, with `--absolute`: jscpd names a file relative
 * to the path argument holding it, a bare file name for a file argument.
 */
export async function resolveJscpdArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const files = await listScannedFiles(config);

  const resolved = [...args];

  // @debt Absolute paths repeat the project root on every clone; project-relative ones need jscpd to name files relative to its cwd.
  ensureIncludes(resolved, "--absolute");

  return [
    ...resolved,
    ...iterable.map(files, (file) => config.context.path(file)),
  ];
}
