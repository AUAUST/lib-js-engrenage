import type { Rule } from "eslint";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";
import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";

function isOnlyCatchStatement(
  descriptor: ReportDescriptor,
  context: Rule.RuleContext,
): boolean {
  if (
    !("node" in descriptor) ||
    descriptor.node.type !== "ReturnStatement" ||
    descriptor.node.loc == null
  ) {
    return false;
  }

  const { sourceCode } = context;

  // @debt ESLint types a report's node as a bare `JSSyntaxElement` without `parent`, so the ESTree node is found again from its start location
  const node = sourceCode.getNodeByRangeIndex(
    sourceCode.getIndexFromLoc(descriptor.node.loc.start),
  );

  if (node?.type !== "ReturnStatement") {
    return false;
  }

  const [clause, block] = sourceCode.getAncestors(node).slice(-2);

  return (
    clause?.type === "CatchClause" &&
    block?.type === "BlockStatement" &&
    block.body.length === 1
  );
}

export default defineConvention({
  delegates: [
    delegateRule("no-useless-return", [], {
      ignoreReport: isOnlyCatchStatement,
    }),
  ],
});
