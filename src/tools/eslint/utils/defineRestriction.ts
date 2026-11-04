import type { Rule } from "eslint";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import type { Trait } from "#project/presets/types/Trait";
import type { Convention } from "#tools/eslint/types/Convention";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export function defineRestriction({
  selector,
  message,
  ...forward
}: {
  selector: string;
  message: string;
  files?: ScopeReferences;
  ignores?: ScopeReferences;
  enabled?: boolean;
  traits?: readonly Trait[];
  requires?: PackageNames;
}): Convention {
  return defineConvention({
    rule: {
      meta: {
        type: "problem",
        docs: {
          description: message,
        },
        messages: {
          restricted: message,
        },
        schema: [],
      },
      create(context) {
        return {
          [selector](node: Rule.Node) {
            context.report({
              node,
              messageId: "restricted",
            });
          },
        };
      },
    },
    ...forward,
  });
}
