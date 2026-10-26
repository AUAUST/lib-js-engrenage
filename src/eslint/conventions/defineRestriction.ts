import type { Rule } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";
import type { Presets } from "#config/types/Presets";
import type { Convention } from "#eslint/types/Convention";
import type { ScopeReference } from "#eslint/types/ScopeReference";

export function defineRestriction({
  selector,
  message,
  files,
  ignores,
  enabled,
  presets,
}: {
  selector: string;
  message: string;
  files?: ReadonlyArray<ScopeReference>;
  ignores?: ReadonlyArray<ScopeReference>;
  enabled?: boolean;
  presets?: Presets;
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
  });
}
