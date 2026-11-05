import { resolve } from "#foundation/filesystem/index";
import { readConfig } from "#project/config/operations/readConfig";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { Directory } from "#types/Directory";

const loadedConfigs = new Map<Directory, Promise<ConfigContext>>();

export function loadConfig(
  cwd: Directory | URL = process.cwd(),
): Promise<ConfigContext> {
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
