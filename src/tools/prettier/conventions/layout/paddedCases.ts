import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { filterMap } from "@auaust/primitive-kit/arrays";

import { createPaddingEdit } from "#tools/prettier/utils/createPaddingEdit";
import { isMultiline } from "#tools/prettier/utils/isMultiline";
import { visitNodes } from "#tools/prettier/utils/visitNodes";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

function hasMultilineBody(node: TSESTree.SwitchCase): boolean {
  const [first] = node.consequent;

  const body =
    node.consequent.length === 1 &&
    first?.type === AST_NODE_TYPES.BlockStatement
      ? first.body
      : node.consequent;

  const [statement, ...others] = body;

  if (statement === undefined) {
    return false;
  }

  return others.length > 0 || isMultiline(statement);
}

function isPadded(
  text: string,
  previous: TSESTree.SwitchCase,
  next: TSESTree.SwitchCase,
): boolean {
  const lines = text.slice(previous.range[1], next.range[0]).split("\n");

  return lines.slice(1, -1).some((line) => {
    return line.trim() === "";
  });
}

function padCases(
  program: TSESTree.Program,
  text: string,
  node: TSESTree.SwitchStatement,
): readonly LayoutEdit[] {
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
    node.cases.some(hasMultilineBody) ||
    pairs.some(({ previous, next }) => {
      return isPadded(text, previous, next);
    });

  if (!requiresPadding) {
    return [];
  }

  return pairs.map(({ previous, next }) => {
    return createPaddingEdit(program, text, previous, next);
  });
}

const paddedCases: LayoutConvention = (program, text) => {
  const edits: LayoutEdit[] = [];

  visitNodes(program, (node) => {
    if (node.type === AST_NODE_TYPES.SwitchStatement) {
      edits.push(...padCases(program, text, node));
    }
  });

  return edits;
};

export default paddedCases;
