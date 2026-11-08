import { map } from "@auaust/primitive-kit/arrays";

import { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
import type { LoadedConfig } from "#project/config/index";

export async function resolveJscpdArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const files = await listScannedFiles(config);

  return [...args, ...map(files, (file) => config.context.path(file))];
}
