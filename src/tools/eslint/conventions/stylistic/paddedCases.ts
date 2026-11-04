import type { Rule, SourceCode } from "eslint";

import { filterMap } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#eslint/conventions/defineConvention";

type SwitchCase = Extract<
  Rule.Node,
  { type: "SwitchStatement" }
>["cases"][number];

const message =
  "Separate a `case` that has statements from the next `case` with a blank line once a case body spans several lines or the `switch` already uses blank lines.";

function hasMultilineBody(sourceCode: SourceCode, node: SwitchCase): boolean {
  const [first] = node.consequent;

  const body =
    node.consequent.length === 1 && first?.type === "BlockStatement"
      ? first.body
      : node.consequent;

  const [statement, ...others] = body;

  if (statement === undefined) {
    return false;
  }

  const { start, end } = sourceCode.getLoc(statement);

  return others.length > 0 || start.line !== end.line;
}

function isPadded(
  sourceCode: SourceCode,
  previous: SwitchCase,
  next: SwitchCase,
): boolean {
  const from = sourceCode.getLoc(previous).end.line;

  const to = sourceCode.getLoc(next).start.line - 1;

  return sourceCode.lines.slice(from, to).some((line) => {
    return line.trim() === "";
  });
}

function findLineEnd(sourceCode: SourceCode, node: SwitchCase): number {
  const lastToken = sourceCode.getLastToken(node);

  if (lastToken === null) {
    throw new Error("A `case` with statements has no last token");
  }

  const { line } = sourceCode.getLoc(lastToken).end;

  const trailingComment = sourceCode
    .getCommentsAfter(lastToken)
    .findLast((comment) => {
      return sourceCode.getLoc(comment).start.line === line;
    });

  return sourceCode.getRange(trailingComment ?? lastToken)[1];
}

export default defineConvention({
  rule: {
    meta: {
      type: "layout",
      fixable: "whitespace",
      docs: {
        description: message,
      },
      messages: {
        paddedCases: message,
      },
      schema: [],
    },
    create(context) {
      const { sourceCode } = context;

      return {
        SwitchStatement(node) {
          const pairs = filterMap(node.cases, (previous, index) => {
            const next = node.cases[index + 1];

            if (next !== undefined && previous.consequent.length > 0) {
              return {
                previous,
                next,
              };
            }
          });

          const requiresPadding =
            node.cases.some((switchCase) => {
              return hasMultilineBody(sourceCode, switchCase);
            }) ||
            pairs.some(({ previous, next }) => {
              return isPadded(sourceCode, previous, next);
            });

          if (!requiresPadding) {
            return;
          }

          for (const { previous, next } of pairs) {
            if (isPadded(sourceCode, previous, next)) {
              continue;
            }

            context.report({
              node: next,
              messageId: "paddedCases",
              fix(fixer) {
                const end = findLineEnd(sourceCode, previous);

                return fixer.insertTextAfterRange([end, end], "\n");
              },
            });
          }
        },
      };
    },
  },
});
