import type { Rule } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";

const message =
  "Return `void` the expression instead of following it with a bare `return` in its own block.";

const functionTypes = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

const unparenthesizedOperands = new Set([
  "ArrayExpression",
  "CallExpression",
  "ChainExpression",
  "ClassExpression",
  "FunctionExpression",
  "Identifier",
  "Literal",
  "MemberExpression",
  "MetaProperty",
  "NewExpression",
  "ObjectExpression",
  "TaggedTemplateExpression",
  "TemplateLiteral",
  "ThisExpression",
  "UnaryExpression",
  "UpdateExpression",
]);

function findStatementThenReturn(node: Rule.Node) {
  if (node.type !== "BlockStatement" || functionTypes.has(node.parent.type)) {
    return;
  }

  const [statement, last, ...others] = node.body;

  if (
    others.length > 0 ||
    statement?.type !== "ExpressionStatement" ||
    last?.type !== "ReturnStatement" ||
    last.argument != null
  ) {
    return;
  }

  return {
    statement,
    last,
  };
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
        preferReturnVoid: message,
      },
      schema: [],
    },
    create(context) {
      const { sourceCode } = context;

      return {
        BlockStatement(node: Rule.Node) {
          const found = findStatementThenReturn(node);

          if (found === undefined) {
            return;
          }

          const { statement, last } = found;

          const [start] = sourceCode.getRange(statement);

          const [, end] = sourceCode.getRange(last);

          const { expression } = statement;

          const text = sourceCode.getText(expression);

          const operand = unparenthesizedOperands.has(expression.type)
            ? text
            : `(${text})`;

          context.report({
            node: last,
            messageId: "preferReturnVoid",
            fix: sourceCode.commentsExistBetween(statement, last)
              ? null
              : (fixer) => {
                  return fixer.replaceTextRange(
                    [start, end],
                    `return void ${operand};`,
                  );
                },
          });
        },
      };
    },
  },
});
