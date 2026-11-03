import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { OptionContext } from "#foundation/options/types/OptionContext";

export interface ConfigContext extends OptionContext<ResolvedConfig> {}
