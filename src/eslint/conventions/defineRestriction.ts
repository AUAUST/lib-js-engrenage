import type { Rule } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";
import type { Presets } from "#config/types/Presets";
import type { Convention } from "#eslint/types/Convention";
import type { ScopeReferences } from "#eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export function defineRestriction({
  selector,
  message,
  files,
  ignores,
  enabled,
  presets,
  requires,
}: {
  selector: string;
  message: string;
  files?: ScopeReferences;
  ignores?: ScopeReferences;
  enabled?: boolean;
  presets?: Presets;
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
    files,
    ignores,
    enabled,
    presets,
    requires,
  });
}
