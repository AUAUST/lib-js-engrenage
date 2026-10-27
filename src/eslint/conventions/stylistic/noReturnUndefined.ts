import type { Rule } from "eslint";

import { find } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#eslint/conventions/defineConvention";

const message = "Use a bare `return;` instead of `return undefined;`.";

export default defineConvention({
  rule: {
    meta: {
      type: "suggestion",
      fixable: "code",
      docs: {
        description: message,
      },
      messages: {
        noReturnUndefined: message,
      },
      schema: [],
    },
    create(context) {
      const { sourceCode } = context;

      return {
        ReturnStatement(node: Rule.Node) {
          if (
            node.type !== "ReturnStatement" ||
            node.argument?.type !== "Identifier" ||
            node.argument.name !== "undefined"
          ) {
            return;
          }

          const { argument } = node;

          const { references } = sourceCode.getScope(node);

          const reference = find(references, ({ identifier }) => {
            return identifier === argument;
          });

          if ((reference?.resolved?.defs.length ?? 0) > 0) {
            return;
          }

          context.report({
            node,
            messageId: "noReturnUndefined",
            fix:
              sourceCode.getCommentsInside(node).length > 0
                ? null
                : (fixer) => {
                    return fixer.replaceText(node, "return;");
                  },
          });
        },
      };
    },
  },
});
