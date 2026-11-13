import type { InputResolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ConfigSections } from "#project/config/types/ConfigSections";

// @debt `forget` reaches every holder of a loaded config, sync targets included, though only `project/sync` drops its resolved keys
/**
 * A loaded project config: it resolves each config key's section on demand from
 * the project's input, and its `context` holds the project root, the staged
 * filesystem and the extension registry.
 *
 * @stable
 */
export type LoadedConfig = InputResolver<ConfigContext, ConfigSections>;
