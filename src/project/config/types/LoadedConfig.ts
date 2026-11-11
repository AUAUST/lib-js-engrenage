import type { InputResolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ConfigSections } from "#project/config/types/ConfigSections";

// @debt `forget` reaches every holder of a loaded config, sync targets included, though only `project/sync` drops its resolved keys
export type LoadedConfig = InputResolver<ConfigContext, ConfigSections>;
