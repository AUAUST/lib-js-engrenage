import { flatMap } from "@auaust/toolkit/iterable";
import { freeze } from "@auaust/toolkit/object";

import {
  resolveEnvironmentGrants,
  type ImportGrants,
} from "#batiment/structure/index";
import { declareSection } from "#foundation/options/index";
import { listEnvironmentInstances } from "#project/structure/operations/listEnvironmentInstances";
import type { ConfigResolver } from "#project/config/index";

export const importGrantsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ImportGrants> {
    const [traits, groups, environments] = await Promise.all([
      config.resolve("traits"),
      config.resolve("workspaces"),
      listEnvironmentInstances(config),
    ]);

    return freeze({
      published: traits.published,
      ...resolveEnvironmentGrants(traits.published, environments),
      scopes: new Map(
        flatMap(groups, (group) => {
          return group.workspaces.map(({ dir, dependencies }) => {
            return [dir, dependencies] as const;
          });
        }),
      ),
    });
  },
});
