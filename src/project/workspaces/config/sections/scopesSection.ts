import { flatMap } from "@auaust/toolkit/array";

import { createScopeTree, type ScopeTree } from "#batiment/scopes/index";
import { declareSection } from "#foundation/options/index";
import { readEnvironment } from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

export const scopesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ScopeTree> {
    const [entries, groups] = await Promise.all([
      config.resolve("environments"),
      config.resolve("workspaces"),
    ]);

    const environments = await Promise.all(
      entries.map(async ({ entry, kind }) => {
        const { dirs } = await readEnvironment(config, entry.name);

        return {
          name: entry.name,
          kind: kind.name,
          dirs,
        };
      }),
    );

    return createScopeTree({
      environments,
      workspaces: flatMap(groups, ({ active, dirs }) => {
        return active ? dirs : [];
      }),
    });
  },
});
