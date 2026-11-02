import type { Rule } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";

const message =
  "Wrap the valued return in the negated check instead of guarding it with an empty `return;`.";

const negatedOperators = {
  "===": "!==",
  "==": "!=",
} as const;

function isNullish(
  node: Extract<Rule.Node, { type: "BinaryExpression" }>["left"],
  loose: boolean,
) {
  if (loose) {
    return node.type === "Literal" && node.raw === "null";
  }

  return node.type === "Identifier" && node.name === "undefined";
}

function findGuard(statement: Rule.Node | undefined) {
  if (
    statement?.type !== "IfStatement" ||
    statement.alternate != null ||
    statement.test.type !== "BinaryExpression" ||
    statement.consequent.type !== "BlockStatement"
  ) {
    return;
  }

  const { left, right, operator } = statement.test;

  if (operator !== "===" && operator !== "==") {
    return;
  }

  const loose = operator === "==";

  const [only, ...others] = statement.consequent.body;

  if (
    others.length > 0 ||
    only?.type !== "ReturnStatement" ||
    only.argument != null ||
    left.type === "PrivateIdentifier"
  ) {
    return;
  }

  const subject = isNullish(right, loose)
    ? left
    : isNullish(left, loose)
      ? right
      : undefined;

  if (subject?.type !== "Identifier") {
    return;
  }

  return {
    statement,
    test: statement.test,
    negated: negatedOperators[operator],
  };
}

export default defineConvention({
  severity: "warn",
  typeAware: true,
  rule: {
    meta: {
      type: "suggestion",
      fixable: "code",
      docs: {
        description: message,
      },
      messages: {
        preferValuedReturn: message,
      },
      schema: [],
    },
    create(context) {
      const { sourceCode } = context;

      const skipped =
        sourceCode.parserServices?.program?.getCompilerOptions()
          .noImplicitReturns === true;

      return {
        BlockStatement(node: Rule.Node) {
          if (
            skipped ||
            node.type !== "BlockStatement" ||
            (node.parent.type !== "FunctionDeclaration" &&
              node.parent.type !== "FunctionExpression" &&
              node.parent.type !== "ArrowFunctionExpression")
          ) {
            return;
          }

          const last = node.body.at(-1);

          // @debt the cast and the redundant node.type check work around the visitor parameter being widened to Rule.Node instead of typing the listener on the BlockStatement node
          const guard = findGuard(node.body.at(-2) as Rule.Node | undefined);

          if (
            guard === undefined ||
            last?.type !== "ReturnStatement" ||
            last.argument == null
          ) {
            return;
          }

          const { statement, test, negated } = guard;

          const { argument } = last;

          context.report({
            node: statement,
            messageId: "preferValuedReturn",
            fix:
              sourceCode.commentsExistBetween(statement, last) ||
              sourceCode.getCommentsInside(statement).length > 0 ||
              sourceCode.getCommentsInside(last).length > 0
                ? null
                : (fixer) => {
                    const [start] = sourceCode.getRange(statement);

                    const [, end] = sourceCode.getRange(last);

                    const left = sourceCode.getText(test.left);

                    const right = sourceCode.getText(test.right);

                    const { column } = sourceCode.getLocFromIndex(start);

                    const indent = sourceCode.text.slice(start - column, start);

                    // @debt the fix hardcodes a two-space indent for the wrapped return instead of deriving the indent unit from the source
                    return fixer.replaceTextRange(
                      [start, end],
                      `if (${left} ${negated} ${right}) {\n${indent}  return ${sourceCode.getText(argument)};\n${indent}}`,
                    );
                  },
          });
        },
      };
    },
  },
});
