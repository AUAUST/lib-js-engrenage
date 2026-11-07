import { loadConfig, type LoadedConfig } from "#project/config/index";
import { validateConfig } from "#workflows/config/operations/validateConfig";
import type { Directory } from "#types/Directory";

const validated = new WeakSet<LoadedConfig>();

export async function loadValidatedConfig(
  cwd?: Directory | URL,
  options?: { searchParents?: boolean },
): Promise<LoadedConfig> {
  const config = await loadConfig(cwd, options);

  if (!validated.has(config)) {
    validateConfig(config);
    validated.add(config);
  }

  return config;
}
