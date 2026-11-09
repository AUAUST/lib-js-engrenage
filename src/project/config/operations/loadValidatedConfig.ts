import { loadConfig } from "#project/config/operations/loadConfig";
import { validateConfig } from "#project/config/operations/validateConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";

const validated = new WeakSet<LoadedConfig>();

export async function loadValidatedConfig(
  cwd?: Directory | URL,
  options?: { searchParents?: boolean },
): Promise<LoadedConfig> {
  const config = await loadConfig(cwd, options);

  if (!validated.has(config)) {
    await validateConfig(config);

    validated.add(config);
  }

  return config;
}
