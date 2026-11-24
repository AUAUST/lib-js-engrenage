import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";

export const versionSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<string | undefined> {
    const { optional } = await config.resolve("packageJson");

    return optional.version;
  },
});
