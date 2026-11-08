import { flatMap } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { traitsSection } from "#project/presets/index";
import { resolveEnvironmentGrants } from "#project/structure/utils/resolveEnvironmentGrants";
import { workspacesSection } from "#project/workspaces/index";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

export const importGrantsSection = declareSection({
  name: "importGrants",
  async resolve(_input, config): Promise<ImportGrants> {
    const [traits, groups] = await Promise.all([
      config.resolve(traitsSection),
      config.resolve(workspacesSection),
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
