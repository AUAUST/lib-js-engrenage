import type { Rule, SourceCode } from "eslint";

import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";
import type { ReportDescriptor } from "#eslint/types/ReportDescriptor";

type Node = Parameters<SourceCode["getAncestors"]>[0];

type ObjectExpression = Extract<Node, { type: "ObjectExpression" }>;

function collectObjects(nodes: readonly (Node | null)[]): ObjectExpression[] {
  const objects: ObjectExpression[] = [];

  for (const node of nodes) {
    if (node?.type === "ObjectExpression" && node.properties.length > 0) {
      objects.push(node);
    } else if (node?.type === "ArrayExpression") {
      objects.push(...collectObjects(node.elements));
    }
  }

  return objects;
}

function getSiblingObjects(
  sourceCode: SourceCode,
  node: ObjectExpression,
): ObjectExpression[] {
  const ancestors = sourceCode.getAncestors(node);

  let container: Node = node;
  let parent = ancestors.pop();

  while (parent?.type === "ArrayExpression") {
    container = parent;
    parent = ancestors.pop();
  }

  if (
    (parent?.type === "CallExpression" || parent?.type === "NewExpression") &&
    parent.arguments.some((argument) => argument === container)
  ) {
    return collectObjects(parent.arguments);
  }

  return collectObjects([container]);
}

function requiresNewlines(
  sourceCode: SourceCode,
  node: ObjectExpression,
): boolean {
  const { start, end } = sourceCode.getLoc(node);

  return (
    start.line !== end.line ||
    node.properties.length >= 3 ||
    node.properties.some((property) => {
      return (
        property.type === "Property" &&
        property.value.type === "ObjectExpression"
      );
    })
  );
}

function allowsInlineObject(
  descriptor: ReportDescriptor,
  { sourceCode }: Rule.RuleContext,
): boolean {
  if (
    !("node" in descriptor) ||
    descriptor.node.type !== "ObjectExpression" ||
    descriptor.node.loc == null
  ) {
    return false;
  }

  const node = sourceCode.getNodeByRangeIndex(
    sourceCode.getIndexFromLoc(descriptor.node.loc.start),
  );

  if (node?.type !== "ObjectExpression") {
    return false;
  }

  return !getSiblingObjects(sourceCode, node).some((sibling) => {
    return requiresNewlines(sourceCode, sibling);
  });
}

export default defineConvention({
  delegates: [
    delegateRule(
      "@stylistic/object-curly-newline",
      [
        {
          ObjectExpression: {
            minProperties: 1,
          },
          ObjectPattern: {
            consistent: true,
          },
          ImportDeclaration: {
            consistent: true,
          },
          ExportDeclaration: {
            consistent: true,
          },
          TSTypeLiteral: {
            consistent: true,
          },
          TSInterfaceBody: {
            consistent: true,
          },
        },
      ],
      {
        ignoreReport: allowsInlineObject,
      },
    ),
  ],
});
