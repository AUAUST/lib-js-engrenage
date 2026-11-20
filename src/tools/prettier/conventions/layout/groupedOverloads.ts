import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { filterMap, flatMap, map } from "@auaust/toolkit/array";

import { collectStatementPairs } from "#tools/prettier/utils/collectStatementPairs";
import { unwrapExports } from "#tools/prettier/utils/unwrapExports";
import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

const groupedTypes: ReadonlySet<string> = new Set([
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.TSDeclareFunction,
]);

function getFunctionName(node: TSESTree.Node): string | undefined {
  const unwrapped = unwrapExports(unwrapLabels(node));

  return unwrapped.type === AST_NODE_TYPES.FunctionDeclaration ||
    unwrapped.type === AST_NODE_TYPES.TSDeclareFunction
    ? unwrapped.id?.name
    : undefined;
}

function isGrouped(previous: TSESTree.Node, next: TSESTree.Node): boolean {
  const previousName = getFunctionName(previous);

  return (
    unwrapExports(unwrapLabels(previous)).type ===
      AST_NODE_TYPES.TSDeclareFunction &&
    groupedTypes.has(unwrapExports(unwrapLabels(next)).type) &&
    previousName !== undefined &&
    previousName === getFunctionName(next)
  );
}

function removePadding(
  program: TSESTree.Program,
  previous: TSESTree.Node,
  next: TSESTree.Node,
): readonly LayoutEdit[] {
  const comments: readonly TSESTree.Comment[] = program.comments ?? [];

  const offsets = filterMap(comments, (comment) => {
    if (
      comment.range[0] >= previous.range[1] &&
      comment.range[0] < next.range[0] &&
      comment.loc.start.line > previous.loc.end.line
    ) {
      return comment.range[0];
    }
  });

  return map([...offsets, next.range[0]], (offset): LayoutEdit => {
    return {
      kind: "blank-line",
      offset,
      present: false,
    };
  });
}

const groupedOverloads: LayoutConvention = (program) => {
  return flatMap(collectStatementPairs(program), ({ previous, next }) => {
    return isGrouped(previous, next)
      ? removePadding(program, previous, next)
      : [];
  });
};

export default groupedOverloads;
