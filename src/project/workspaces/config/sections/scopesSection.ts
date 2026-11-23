import { declareSection } from "#foundation/options/index";
import type { ScopeTree } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";

export const scopesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ScopeTree> {
    const context = await config.resolve("structure.context");

    const { tree } = await context.discover();

    return tree;
  },
});
