import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { map } from "@auaust/primitive-kit/arrays";

import { isMultiline } from "#tools/prettier/utils/isMultiline";
import { visitNodes } from "#tools/prettier/utils/visitNodes";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

function collectObjects(
  nodes: readonly (TSESTree.Node | null)[],
): TSESTree.ObjectExpression[] {
  const objects: TSESTree.ObjectExpression[] = [];

  for (const node of nodes) {
    if (
      node?.type === AST_NODE_TYPES.ObjectExpression &&
      node.properties.length > 0
    ) {
      objects.push(node);
    } else if (node?.type === AST_NODE_TYPES.ArrayExpression) {
      objects.push(...collectObjects(node.elements));
    }
  }

  return objects;
}

function getSiblingObjects(
  node: TSESTree.ObjectExpression,
  ancestors: readonly TSESTree.Node[],
): TSESTree.ObjectExpression[] {
  const lineage = [...ancestors];

  let container: TSESTree.Node = node;
  let parent = lineage.pop();

  while (parent?.type === AST_NODE_TYPES.ArrayExpression) {
    container = parent;
    parent = lineage.pop();
  }

  if (
    (parent?.type === AST_NODE_TYPES.CallExpression ||
      parent?.type === AST_NODE_TYPES.NewExpression) &&
    parent.arguments.includes(container)
  ) {
    return collectObjects(parent.arguments);
  }

  const owner = lineage.pop();

  if (
    parent?.type === AST_NODE_TYPES.Property &&
    parent.value === container &&
    owner?.type === AST_NODE_TYPES.ObjectExpression
  ) {
    return collectObjects(
      map(owner.properties, (property) => {
        return property.type === AST_NODE_TYPES.Property
          ? property.value
          : null;
      }),
    );
  }

  return collectObjects([container]);
}

function requiresNewlines(node: TSESTree.ObjectExpression): boolean {
  return (
    isMultiline(node) ||
    node.properties.length >= 3 ||
    node.properties.some((property) => {
      return (
        property.type === AST_NODE_TYPES.Property &&
        property.value.type === AST_NODE_TYPES.ObjectExpression
      );
    })
  );
}

const objectCurlyNewline: LayoutConvention = (program) => {
  const edits: LayoutEdit[] = [];

  visitNodes(program, (node, ancestors) => {
    if (
      node.type === AST_NODE_TYPES.ObjectExpression &&
      node.properties.length > 0 &&
      getSiblingObjects(node, ancestors).some(requiresNewlines)
    ) {
      edits.push({
        kind: "line-break",
        offset: node.range[0],
      });
    }
  });

  return edits;
};

export default objectCurlyNewline;
