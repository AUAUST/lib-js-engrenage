import {
  doc,
  type AstPath,
  type Doc,
  type ParserOptions,
  type Printer,
} from "prettier";

import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";
import { isString } from "@auaust/toolkit/isString";

import { isAstNode } from "#tools/prettier/utils/isAstNode";
import { keepsOwnBreak } from "#tools/prettier/utils/keepsOwnBreak";
import { printLines } from "#tools/prettier/utils/printLines";
import type { AstNode } from "#tools/prettier/types/AstNode";

const { group, ifBreak, indent, softline } = doc.builders;

const branchKeys = new Set(["consequent", "alternate"]);

const childKeys = ["test", ...branchKeys];

const jsxTypes = new Set(["JSXElement", "JSXFragment"]);

function containsJsx(node: AstNode): boolean {
  return childKeys.some((key) => {
    const child = node[key];

    return (
      isAstNode(child) &&
      (jsxTypes.has(child.type) ||
        (child.type === "ConditionalExpression" && containsJsx(child)))
    );
  });
}

function findChainTop(
  path: AstPath<AstNode>,
  node: AstNode,
  depth: number,
): AstNode {
  const parent: unknown = path.getParentNode(depth);

  return isAstNode(parent) &&
    parent.type === "ConditionalExpression" &&
    parent.test !== node
    ? findChainTop(path, parent, depth + 1)
    : node;
}

// @debt the indent Prettier gives the operands after the first is found by the shape of its internal `printBinaryishExpression`, which no API exposes
function withoutOwnIndent(target: Doc): Doc {
  if (
    !isObject(target) ||
    isArray(target) ||
    target.type !== "group" ||
    !isArray(target.contents)
  ) {
    return target;
  }

  const last = target.contents.at(-1);

  return isObject(last) && !isArray(last) && last.type === "indent"
    ? {
        ...target,
        contents: [...target.contents.slice(0, -1), last.contents],
      }
    : target;
}

export function printConditional(
  path: AstPath<AstNode>,
  options: ParserOptions<AstNode>,
  print: Parameters<Printer<AstNode>["print"]>[2],
  args: unknown,
  base: Printer<AstNode>,
): Doc {
  // @debt Prettier's JSX mode, which already parenthesizes every branch, is detected by copying the condition of its internal `printTernary`, which no API exposes
  if (containsJsx(findChainTop(path, path.node, 0))) {
    return base.print(path, options, print, args);
  }

  return base.print(
    path,
    options,
    (selector, selectorArgs) => {
      const printed = print(selector, selectorArgs);

      const node = isString(selector) && branchKeys.has(selector)
        ? path.node[selector]
        : undefined;

      return !isAstNode(node) ||
        keepsOwnBreak(node, printed) ||
        printLines(printed, options, 0).length === 1
        ? printed
        : group([
            ifBreak("("),
            indent([softline, withoutOwnIndent(printed)]),
            softline,
            ifBreak(")"),
          ]);
    },
    args,
  );
}
