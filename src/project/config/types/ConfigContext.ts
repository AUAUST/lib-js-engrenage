import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { OptionContext } from "#options/types/OptionContext";

export interface ConfigContext extends OptionContext<ResolvedConfig> {}
