import { map as mapIterable } from "@auaust/toolkit/iterable";

import { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
import type { LoadedConfig } from "#project/config/index";

export async function resolveJscpdArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const files = await listScannedFiles(config);

  return [...args, ...mapIterable(files, (file) => config.context.path(file))];
}
