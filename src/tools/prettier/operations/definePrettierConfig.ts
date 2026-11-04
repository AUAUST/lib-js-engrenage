import { value } from "@auaust/toolkit/value";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createContext } from "#project/config/utils/createContext";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Config } from "#tools/prettier/types/Config";
import type { Resolvable } from "#types/Resolvable";

export async function definePrettierConfig(
  options?: Resolvable<Config, [ProjectConfig]>,
): Promise<Config> {
  const config = await loadConfig();

  const resolvedOptions = await value(options, config);

  return createPrettierConfig(
    createContext(config),
    resolvedOptions ?? undefined,
  );
}
