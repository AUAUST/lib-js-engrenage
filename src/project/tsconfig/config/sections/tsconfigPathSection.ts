import { declareSection, type Resolver } from "#foundation/options/index";
import { locateTsconfigPath } from "#project/tsconfig/operations/locateTsconfigPath";
import type { ConfigContext } from "#project/config/index";

export const tsconfigPathSection = declareSection({
  name: "tsconfigPath",
  live: true,
  resolve(_input, config: Resolver<ConfigContext>) {
    return locateTsconfigPath(config);
  },
});
