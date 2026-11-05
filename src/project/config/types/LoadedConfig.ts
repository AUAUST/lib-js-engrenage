import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { RawConfig } from "#project/config/types/RawConfig";

export interface LoadedConfig extends Resolver<ConfigContext> {
  // @debt `raw` lets three readers bypass the sections until each section is validated once (#249)
  readonly raw: RawConfig;
}
