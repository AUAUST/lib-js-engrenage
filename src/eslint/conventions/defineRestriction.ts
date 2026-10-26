import type { Rule } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";
import type { Convention } from "#eslint/types/Convention";
import type { ScopeReference } from "#eslint/types/ScopeReference";

export function defineRestriction({
  selector,
  message,
  files,
  ignores,
  enabled,
}: {
  selector: string;
  message: string;
  files?: readonly ScopeReference[];
  ignores?: readonly ScopeReference[];
  enabled?: boolean;
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
  });
}
