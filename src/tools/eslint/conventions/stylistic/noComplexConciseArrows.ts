import type { Rule } from "eslint";

import { join } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#tools/eslint/utils/defineConvention";

const complexMessage =
  "Use a block body with an explicit return; concise bodies are only for a short identifier, literal, member access, negation, comparison, call, template literal, array of identifiers, literals or member accesses, or one of those asserted `as const`.";

const wrappedMessage =
  "Use a block body with an explicit return; a concise body stays whole on the line of its `=>`.";

const conciseBodies = join(
  [
    "ArrayExpression",
    "BlockStatement",
    "Identifier",
    "Literal",
    "MemberExpression",
    "UnaryExpression",
    "BinaryExpression",
    "CallExpression",
    "TemplateLiteral",
    "TSAsExpression",
  ],
  "|",
);

const constAssertedBodies = join(
  ["ArrayExpression", "Literal", "TemplateLiteral"],
  "|",
);

const complexArray =
  "ArrayExpression:has(> :not(Identifier, Literal, MemberExpression))";

const complexBodies = join(
  [
    `ArrowFunctionExpression[body.type!=/^(${conciseBodies})$/]`,
    `ArrowFunctionExpression[body.type='TSAsExpression']:not([body.typeAnnotation.typeName.name='const'][body.expression.type=/^(${constAssertedBodies})$/])`,
    `ArrowFunctionExpression:has(> ${complexArray})`,
    `ArrowFunctionExpression:has(> TSAsExpression:has(> ${complexArray}))`,
  ],
  ", ",
);

export default defineConvention({
  rule: {
    meta: {
      type: "suggestion",
      fixable: "code",
      docs: {
        description: `${complexMessage} ${wrappedMessage}`,
      },
      messages: {
        complexConciseArrow: complexMessage,
        wrappedConciseArrow: wrappedMessage,
      },
      schema: [],
    },
    create(context) {
      const { sourceCode } = context;

      const reported = new WeakSet<Rule.Node>();

      function findArrow(
        node: Rule.Node & { type: "ArrowFunctionExpression" },
      ) {
        const arrow = sourceCode.getTokenBefore(node.body, {
          filter(token) {
            return token.value === "=>";
          },
        });

        if (arrow === null) {
          throw new Error("Cannot find the arrow of a concise arrow body");
        }

        return arrow;
      }

      function report(
        node: Rule.Node & { type: "ArrowFunctionExpression" },
        messageId: "complexConciseArrow" | "wrappedConciseArrow",
      ): void {
        const arrow = findArrow(node);

        const [, start] = sourceCode.getRange(arrow);

        const [, end] = sourceCode.getRange(node);

        const text = sourceCode.text.slice(start, end).trim();

        const body = sourceCode.commentsExistBetween(arrow, node.body)
          ? `(${text})`
          : text;

        const line = sourceCode.lines[sourceCode.getLoc(node).start.line - 1];

        const indent = /^\s*/u.exec(line ?? "")?.[0] ?? "";

        reported.add(node);

        context.report({
          node,
          messageId,
          fix(fixer) {
            return fixer.replaceTextRange(
              [start, end],
              ` {\n${indent}  return ${body};\n${indent}}`,
            );
          },
        });
      }

      return {
        [complexBodies](node: Rule.Node) {
          if (node.type === "ArrowFunctionExpression") {
            report(node, "complexConciseArrow");
          }
        },
        // @debt the wrapped check reads the source layout, so a one-line body Prettier wraps later passes until the next lint of the formatted file
        "ArrowFunctionExpression[body.type!='BlockStatement']:exit"(
          node: Rule.Node,
        ) {
          if (node.type !== "ArrowFunctionExpression" || reported.has(node)) {
            return;
          }

          const arrowLine = sourceCode.getLoc(findArrow(node)).end.line;

          if (arrowLine !== sourceCode.getLoc(node).end.line) {
            report(node, "wrappedConciseArrow");
          }
        },
      };
    },
  },
});
