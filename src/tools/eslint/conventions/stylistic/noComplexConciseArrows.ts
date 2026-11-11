import type { Rule } from "eslint";

import { join } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#tools/eslint/utils/defineConvention";

const complexMessage = "Use a block body with an explicit return; concise bodies are only for a short identifier, literal, member access, negation, comparison, call, template literal, array of identifiers, literals or member accesses, or one of those asserted `as const`.";

const wrappedMessage = "Use a block body with an explicit return; a concise body stays whole on the line of its `=>`.";

const longMessage = "Use a block body with an explicit return; a concise arrow stays on a line within the line width.";

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

const complexArray = "ArrayExpression:has(> :not(Identifier, Literal, MemberExpression))";

const complexBodies = join(
  [
    `ArrowFunctionExpression[body.type!=/^(${conciseBodies})$/]`,
    `ArrowFunctionExpression[body.type='TSAsExpression']:not([body.typeAnnotation.typeName.name='const'][body.expression.type=/^(${constAssertedBodies})$/])`,
    `ArrowFunctionExpression[body.type='ArrayExpression']:has(> ${complexArray})`,
    `ArrowFunctionExpression[body.type='TSAsExpression'][body.expression.type='ArrayExpression']:has(> TSAsExpression:has(> ${complexArray}))`,
  ],
  ", ",
);

export default defineConvention({
  sections: { format: "format" },
  rule({ format }) {
    return {
      meta: {
        type: "suggestion",
        fixable: "code",
        docs: {
          description: `${complexMessage} ${wrappedMessage} ${longMessage}`,
        },
        messages: {
          complexConciseArrow: complexMessage,
          wrappedConciseArrow: wrappedMessage,
          longConciseArrow: longMessage,
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
          messageId:
            "complexConciseArrow" | "wrappedConciseArrow" | "longConciseArrow",
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

        function lineWidth(line: number): number {
          const text = sourceCode.lines[line - 1] ?? "";

          return text.replaceAll("\t", " ".repeat(format.indentWidth)).length;
        }

        function sharesLineWithConciseAncestor(
          node: Rule.Node,
          line: number,
        ): boolean {
          let ancestor: Rule.Node | null = node.parent;

          while (ancestor !== null) {
            if (
              ancestor.type === "ArrowFunctionExpression" &&
              ancestor.body.type !== "BlockStatement"
            ) {
              return sourceCode.getLoc(findArrow(ancestor)).end.line === line;
            }

            ancestor = ancestor.parent;
          }

          return false;
        }

        return {
          [complexBodies](node: Rule.Node) {
            if (node.type === "ArrowFunctionExpression") {
              report(node, "complexConciseArrow");
            }
          },
          // @debt the wrapped and width checks read the source layout, not the formatted one, so a line Prettier rewraps passes or fails until the next lint of the formatted file
          "ArrowFunctionExpression[body.type!='BlockStatement']:exit"(
            node: Rule.Node,
          ) {
            if (node.type !== "ArrowFunctionExpression" || reported.has(node)) {
              return;
            }

            const arrowLine = sourceCode.getLoc(findArrow(node)).end.line;

            if (arrowLine !== sourceCode.getLoc(node).end.line) {
              report(node, "wrappedConciseArrow");
            } else if (
              lineWidth(arrowLine) > format.lineWidth &&
              !sharesLineWithConciseAncestor(node, arrowLine)
            ) {
              report(node, "longConciseArrow");
            }
          },
        };
      },
    };
  },
});
