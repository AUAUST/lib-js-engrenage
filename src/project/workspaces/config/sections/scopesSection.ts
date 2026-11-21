import { flatMap, map } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { createScopeTree, type ScopeTree } from "#batiment/scopes/index";
import { declareSection } from "#foundation/options/index";
import { readEnvironment } from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

export const scopesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ScopeTree> {
    const [entries, groups, discovery] = await Promise.all([
      config.resolve("environments"),
      config.resolve("workspaces"),
      config.resolve("scopes.discovery"),
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

    const tree = createScopeTree({
      environments,
      workspaces: map(discovery.workspaces, ({ dir }) => dir),
      missing: flatMap(groups, ({ glob, missing }) => {
        return map(missing, (dir) => {
          return { dir, glob };
        });
      }),
    });

    return freeze({
      ...tree,
      diagnostics: freeze([...discovery.diagnostics, ...tree.diagnostics]),
    });
  },
});
