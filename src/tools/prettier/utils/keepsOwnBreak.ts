import type { Doc } from "prettier";

import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";

import { isAstNode } from "#tools/prettier/utils/isAstNode";
import { isParenthesized } from "#tools/prettier/utils/isParenthesized";
import type { AstNode } from "#tools/prettier/types/AstNode";

const ownBreakTypes = new Set([
  "ArrayExpression",
  "ArrowFunctionExpression",
  "CallExpression",
  "ClassExpression",
  "ConditionalExpression",
  "FunctionExpression",
  "ImportExpression",
  "JSXElement",
  "JSXFragment",
  "MemberExpression",
  "NewExpression",
  "ObjectExpression",
  "OptionalCallExpression",
  "OptionalMemberExpression",
  "TaggedTemplateExpression",
  "TemplateLiteral",
]);

const wrapperKeys = new Map([
  ["AwaitExpression", "argument"],
  ["UnaryExpression", "argument"],
  ["YieldExpression", "argument"],
  ["ChainExpression", "expression"],
  ["TSNonNullExpression", "expression"],
  ["TSAsExpression", "expression"],
  ["TSSatisfiesExpression", "expression"],
]);

const prefixWrapperTypes = new Set([
  "AwaitExpression",
  "UnaryExpression",
  "YieldExpression",
]);

// @debt the operand's doc is found as the last part of the doc Prettier prints a prefix wrapper in, a shape no API exposes
function lastPart(target: Doc): Doc | undefined {
  if (isArray(target)) {
    return target.at(-1);
  }

  return isObject(target) && target.type === "label"
    ? lastPart(target.contents)
    : undefined;
}

function keepsBreak(node: AstNode, printed: Doc | undefined): boolean {
  if (printed !== undefined && isParenthesized(printed)) {
    return true;
  }

  const key = wrapperKeys.get(node.type);

  const operand = key === undefined ? undefined : node[key];

  if (isAstNode(operand)) {
    return keepsBreak(
      operand,
      prefixWrapperTypes.has(node.type) && printed !== undefined
        ? lastPart(printed)
        : undefined,
    );
  }

  const { type } = node;

  return (
    ownBreakTypes.has(type) ||
    (type.startsWith("TS") && !type.endsWith("Expression"))
  );
}

export function keepsOwnBreak(node: AstNode, printed: Doc): boolean {
  return keepsBreak(node, printed);
}
