import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

export interface ConfigContext extends OptionContext<ResolvedConfig> {}
