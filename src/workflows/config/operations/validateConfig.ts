import { values } from "@auaust/toolkit/object";

import { listConfigSections } from "#workflows/config/operations/listConfigSections";
import type { LoadedConfig } from "#project/config/index";

export function validateConfig(config: LoadedConfig): LoadedConfig {
  config.validate(values(listConfigSections()));

  return config;
}
