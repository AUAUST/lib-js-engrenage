import { flatMap } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { resolveEnvironmentGrants } from "#project/structure/utils/resolveEnvironmentGrants";
import type { ConfigResolver } from "#project/config/index";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

export const importGrantsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ImportGrants> {
    const [traits, groups] = await Promise.all([
      config.resolve("traits"),
      config.resolve("workspaces"),
    ]);

    return freeze({
      published: traits.published,
      ...resolveEnvironmentGrants(traits.published),
      workspaces: new Map(
        flatMap(groups, (group) => {
          return group.workspaces.map(({ dir, dependencies }) => {
            return [dir, dependencies] as const;
          });
        }),
      ),
    });
  },
});
