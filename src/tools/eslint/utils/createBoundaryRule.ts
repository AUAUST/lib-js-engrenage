import boundaries from "eslint-plugin-boundaries";

import { create } from "@auaust/toolkit/object";

import { resolveBoundaries } from "#tools/eslint/utils/resolveBoundaries";
import type { BoundaryRow } from "#tools/eslint/types/BoundaryRow";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { Plugin } from "#tools/eslint/types/Plugin";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

// @debt the package typings describe its default export as the module namespace, while Node exposes the plugin itself
const plugin = boundaries as unknown as Plugin;

export function createBoundaryRule(
  config: ConventionConfig,
  row: BoundaryRow,
): RuleModule {
  const dependencies = plugin.rules?.dependencies;

  if (dependencies === undefined) {
    throw new Error("The boundaries plugin has no dependencies rule");
  }

  const generated = resolveBoundaries(config).rules[row];

  return {
    ...dependencies,
    meta: {
      ...dependencies.meta,
      defaultOptions: [{}],
      schema: [
        {
          type: "object",
          properties: {
            policies: { type: "array" },
          },
          additionalProperties: false,
        },
      ],
    },
    create(context) {
      const [{ policies = [] } = {}] = context.options as [
        { policies?: unknown[] }?,
      ];

      // @debt a fresh options object per file misses the boundaries plugin's identity-keyed caches, so every file revalidates and renormalizes every policy
      const options: unknown[] = [
        {
          ...generated,
          policies: [...generated.policies, ...policies],
        },
      ];

      return dependencies.create(
        create(context, {
          options: { value: options },
        }),
      );
    },
  };
}
