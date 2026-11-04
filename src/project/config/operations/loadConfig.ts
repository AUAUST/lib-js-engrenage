import { resolve } from "#foundation/filesystem/utils/resolve";
import { readConfig } from "#project/config/operations/readConfig";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Directory } from "#types/Directory";

const loadedConfigs = new Map<Directory, Promise<ResolvedConfig>>();

export function loadConfig(
  cwd: Directory | URL = process.cwd(),
): Promise<ResolvedConfig> {
  const start = resolve(cwd);

  const cached = loadedConfigs.get(start);

  if (cached !== undefined) {
    return cached;
  }

  const loaded = readConfig(start);

  loadedConfigs.set(start, loaded);

  loaded.catch(() => {
    loadedConfigs.delete(start);
  });

  return loaded;
}
