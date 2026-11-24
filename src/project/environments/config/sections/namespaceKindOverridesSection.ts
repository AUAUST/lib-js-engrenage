import { flatMap } from "@auaust/toolkit/array";
import { keys } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { namespaceKindsSchema } from "#project/environments/config/schemas/namespaceKindsSchema";
import type { ConfigResolver } from "#project/config/index";

export const namespaceKindOverridesSection = declareSection({
  declaration: namespaceKindsSchema,
  resolve(input, config: ConfigResolver) {
    const overrides = namespaceKindsSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "namespaceKinds",
    );

    const names = new Set(
      flatMap(config.context.registry.extensions, ({ contributes }) => {
        return (contributes?.namespaceKinds ?? []).map(({ name }) => name);
      }),
    );

    const unknown = keys(overrides).filter((name) => !names.has(name));

    if (unknown.length > 0) {
      throw new Error(
        `The namespaceKinds config names ${unknown.join(", ")}, which no contributed namespace kind takes`,
      );
    }

    return overrides;
  },
});
