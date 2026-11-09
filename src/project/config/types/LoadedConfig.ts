import type { InputResolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ConfigSections } from "#project/config/types/ConfigSections";

export type LoadedConfig = InputResolver<ConfigContext, ConfigSections>;
