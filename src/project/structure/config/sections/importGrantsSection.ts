import { flatMap } from "@auaust/toolkit/iterable";
import { freeze } from "@auaust/toolkit/object";

import { listNamespaces } from "#batiment/scopes/index";
import {
  resolveNamespaceGrants,
  type ImportGrants,
} from "#batiment/structure/index";
import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";

export const importGrantsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ImportGrants> {
    const [traits, groups, tree] = await Promise.all([
      config.resolve("traits"),
      config.resolve("workspaces"),
      config.resolve("scopes"),
    ]);

    return freeze({
      published: traits.published,
      ...resolveNamespaceGrants(traits.published, listNamespaces(tree)),
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
