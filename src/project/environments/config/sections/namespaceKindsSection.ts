import { freeze, getOwn, keys } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { namespaceKindsSchema } from "#project/environments/config/schemas/namespaceKindsSchema";
import type { NamespaceKind } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";

export const namespaceKindsSection = declareSection({
  declaration: namespaceKindsSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<readonly NamespaceKind[]> {
    const overrides = namespaceKindsSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "namespaceKinds",
    );

    const contributions = await config.context.registry.contributions(
      "namespaceKinds",
      config,
    );

    const names = new Set(contributions.map(({ entry }) => entry.name));

    const unknown = keys(overrides).filter((name) => !names.has(name));

    if (unknown.length > 0) {
      throw new Error(
        `The namespaceKinds config names ${unknown.join(", ")}, which no contributed namespace kind takes`,
      );
    }

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
