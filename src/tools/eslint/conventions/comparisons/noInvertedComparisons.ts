import type { Rule } from "eslint";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";
import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";

const invertedEqualities: ReadonlyMap<string, string> = new Map([
  ["===", "!=="],
  ["!==", "==="],
  ["==", "!="],
  ["!=", "=="],
]);

function fixInvertedEquality(
  descriptor: ReportDescriptor,
  { sourceCode }: Rule.RuleContext,
): Rule.ReportFixer | null {
  if (!("node" in descriptor) || descriptor.node.loc == null) {
    return null;
  }

  const node = sourceCode.getNodeByRangeIndex(
    sourceCode.getIndexFromLoc(descriptor.node.loc.start),
  );

  if (
    node?.type !== "UnaryExpression" ||
    node.argument.type !== "BinaryExpression"
  ) {
    return null;
  }

  const { left, operator, right } = node.argument;

  const inverted = invertedEqualities.get(operator);

  if (inverted === undefined) {
    return null;
  }

  const bang = sourceCode.getFirstToken(node);

  const operatorToken = sourceCode.getFirstTokenBetween(left, right, {
    filter: ({ type, value }) => {
      return type === "Punctuator" && value === operator;
    },
  });

  if (bang?.value !== "!" || operatorToken === null) {
    return null;
  }

  // @debt the fix keeps the parentheses the negation needed, leaving `if ((a === b))` for the formatter to clean up; dropping them needs a precedence check against the parent
  return (fixer) => {
    return [fixer.remove(bang), fixer.replaceText(operatorToken, inverted)];
  };
}

export default defineConvention({
  delegates: [
    delegateRule("sonarjs/no-inverted-boolean-check", [], {
      fix: fixInvertedEquality,
    }),
  ],
});
