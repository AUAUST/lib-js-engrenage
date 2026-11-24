import { freeze, getOwn } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import type { NamespaceKind } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";

export const namespaceKindsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<readonly NamespaceKind[]> {
    const [overrides, contributions] = await Promise.all([
      config.resolve("namespaceKinds.overrides"),
      config.context.registry.contributions("namespaceKinds", config),
    ]);

    return freeze(
      contributions.map(({ entry }) => {
        const { imports, inward } = getOwn(overrides, entry.name) ?? {};

        return freeze({
          ...entry,
          ...(imports === undefined ? {} : { imports: freeze(imports) }),
          ...(inward === undefined ? {} : { inward }),
        });
      }),
    );
  },
});
