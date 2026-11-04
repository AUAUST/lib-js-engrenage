import stylistic from "@stylistic/eslint-plugin";
import { importX } from "eslint-plugin-import-x";
import perfectionist from "eslint-plugin-perfectionist";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import { builtinRules } from "eslint/use-at-your-own-risk";
import { plugin as typescript } from "typescript-eslint";

import type { Plugin } from "#eslint/types/Plugin";
import type { RuleModule } from "#eslint/types/RuleModule";

const upstreamPlugins: Record<string, Plugin> = {
  "@stylistic": stylistic,
  "@typescript-eslint": typescript,
  "import-x": importX,
  perfectionist,
  unicorn,
  "unused-imports": unusedImports,
};

function findRule(id: string): RuleModule | undefined {
  const separator = id.lastIndexOf("/");

  if (separator === -1) {
    return builtinRules.get(id);
  }

  return upstreamPlugins[id.slice(0, separator)]?.rules?.[
    id.slice(separator + 1)
  ];
}

export function findUpstreamRule(id: string): RuleModule {
  const rule = findRule(id);

  if (rule === undefined) {
    throw new Error(`Unknown upstream ESLint rule "${id}"`);
  }

  return rule;
}
