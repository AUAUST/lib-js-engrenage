import { pluginsToRulesDTS } from "eslint-typegen/core";

import { mapValues } from "@auaust/toolkit/object";

import { normalizeRuleSchema, type Plugin } from "#tools/eslint/index";
import type { RuleSource } from "#scripts/codegen/types/RuleSource";

// @debt `json-schema-to-typescript-lite` appends `| undefined` to every index signature under `strictIndexSignatures`, which `eslint-typegen` forces, even to `unknown`; this patches its text output instead of its type AST.
const redundantIndexUndefined = /(\[k: string\]: unknown) \| undefined(?=[;,\n])/g;

function normalizePluginSchemas(plugin: Plugin): Plugin {
  const rules = mapValues(plugin.rules ?? {}, (rule) => {
    return {
      ...rule,
      meta: {
        ...rule.meta,
        schema: normalizeRuleSchema(rule.meta?.schema),
      },
    };
  });

  return {
    rules,
  };
}

export async function createRuleDeclarations({
  name,
  prefix,
  plugin,
}: RuleSource): Promise<string> {
  const declarations = await pluginsToRulesDTS(
    {
      [prefix]: normalizePluginSchemas(plugin),
    },
    {
      exportTypeName: name,
      includeAugmentation: false,
      includeIgnoreComments: false,
      includeTypeImports: false,
    },
  );

  return declarations
    .replaceAll("Linter.RuleEntry<", "Rule<")
    .replaceAll(redundantIndexUndefined, "$1");
}
