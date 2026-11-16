import { iterable } from "@auaust/toolkit";

import { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
import type { LoadedConfig } from "#project/config/index";

export async function resolveJscpdArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const files = await listScannedFiles(config);

  return [...args, ...iterable.map(files, (file) => config.context.path(file))];
}
