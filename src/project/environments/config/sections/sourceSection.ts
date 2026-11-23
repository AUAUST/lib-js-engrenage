import { declareSection } from "#foundation/options/index";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedSource } from "#project/environments/types/ResolvedSource";

export const sourceSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedSource> {
    const option = await config.resolve("src.options");

    return resolveEnvironment(config, option, "src");
  },
});
