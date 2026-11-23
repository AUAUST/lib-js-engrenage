import { declareSection } from "#foundation/options/index";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedScripts } from "#project/environments/types/ResolvedScripts";

export const scriptsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedScripts> {
    const option = await config.resolve("scripts.options");

    return resolveEnvironment(config, option, "scripts");
  },
});
