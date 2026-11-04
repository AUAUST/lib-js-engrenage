import type { Rule, Scope } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";

const message =
  "Use a bare `return;` instead of `return undefined;` in a function with a return type annotation.";

function findEnclosingFunction(node: Rule.Node) {
  let current: Rule.Node | null = node.parent;

  while (current != null) {
    if (
      current.type === "FunctionDeclaration" ||
      current.type === "FunctionExpression" ||
      current.type === "ArrowFunctionExpression"
    ) {
      return current;
    }

    current = current.parent;
  }
}

function isGlobalUndefined(scope: Scope.Scope | null) {
  let current = scope;

  while (current != null) {
    const variable = current.set.get("undefined");

    if (variable !== undefined) {
      return variable.defs.length === 0;
    }

    current = current.upper;
  }

  return true;
}

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
        ReturnStatement(node) {
          const { argument } = node;

          if (
            argument?.type !== "Identifier" ||
            argument.name !== "undefined"
          ) {
            return;
          }

          // @debt the rule is typed against ESLint core ESTree nodes, which lack TypeScript fields, so the return type is probed with an `in` check instead of typed typescript-eslint nodes
          const fn = findEnclosingFunction(node);

          if (
            fn === undefined ||
            fn.generator ||
            !("returnType" in fn) ||
            fn.returnType == null ||
            !isGlobalUndefined(sourceCode.getScope(node))
          ) {
            return;
          }

          context.report({
            node,
            messageId: "noReturnUndefined",
            fix(fixer) {
              const returnToken = sourceCode.getFirstToken(node);

              const lastToken = sourceCode.getLastToken(node);

              if (returnToken == null || lastToken == null) {
                return null;
              }

              const argumentEnd =
                lastToken.value === ";"
                  ? sourceCode.getTokenBefore(lastToken)
                  : lastToken;

              if (
                argumentEnd == null ||
                sourceCode.commentsExistBetween(returnToken, argumentEnd)
              ) {
                return null;
              }

              return fixer.removeRange([
                returnToken.range[1],
                argumentEnd.range[1],
              ]);
            },
          });
        },
      };
    },
  },
});
