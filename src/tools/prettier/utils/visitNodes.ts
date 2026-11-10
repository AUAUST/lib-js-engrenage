import type { TSESTree } from "@typescript-eslint/types";

import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";
import { isString } from "@auaust/toolkit/isString";
import { entries } from "@auaust/toolkit/object";

const metadataKeys: ReadonlySet<string> = new Set([
  "comments",
  "loc",
  "parent",
  "range",
  "tokens",
]);

function isNode(value: unknown): value is TSESTree.Node {
  return isObject(value) && "type" in value && isString(value.type);
}

export function visitNodes(
  node: TSESTree.Node,
  visit: (node: TSESTree.Node, ancestors: readonly TSESTree.Node[]) => void,
  ancestors: readonly TSESTree.Node[] = [],
): void {
  visit(node, ancestors);

  const path = [...ancestors, node];

  for (const [key, value] of entries(node)) {
    if (metadataKeys.has(key)) {
      continue;
    }

    for (const child of isArray(value) ? value : [value]) {
      if (isNode(child)) {
        visitNodes(child, visit, path);
      }
    }
  }
}
