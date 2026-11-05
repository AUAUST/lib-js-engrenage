import { resolve } from "#foundation/filesystem/index";
import { readConfig } from "#workflows/registry/operations/readConfig";
import type { OptionContext } from "#foundation/options/index";
import type { Directory } from "#types/Directory";
import type { Config } from "#workflows/registry/types/Config";

const loadedConfigs = new Map<Directory, Promise<OptionContext<Config>>>();

export function loadConfig(
  cwd: Directory | URL = process.cwd(),
): Promise<OptionContext<Config>> {
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
