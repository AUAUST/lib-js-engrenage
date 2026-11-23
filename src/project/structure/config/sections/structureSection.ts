import { rootScope } from "#batiment/scopes/constants";
import { declareSection } from "#foundation/options/index";
import type { ResolvedStructure } from "#batiment/structure/index";
import type { ConfigResolver } from "#project/config/index";

export const structureSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedStructure> {
    const context = await config.resolve("structure.context");

    return context.walk(rootScope);
  },
});
