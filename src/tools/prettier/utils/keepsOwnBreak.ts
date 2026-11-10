import type { Doc } from "prettier";

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

function unwrap(node: AstNode): AstNode {
  const key = wrapperKeys.get(node.type);

  const inner = key === undefined ? undefined : node[key];

  return isAstNode(inner) ? unwrap(inner) : node;
}

// @debt a wrapper whose operand Prettier parenthesizes (`!(a || b)`, `await (a || b)`) is classified by its operand, so it takes a second pair of parentheses around Prettier's
export function keepsOwnBreak(node: AstNode, printed: Doc): boolean {
  const { type } = unwrap(node);

  return (
    ownBreakTypes.has(type) ||
    (type.startsWith("TS") && !type.endsWith("Expression")) ||
    isParenthesized(printed)
  );
}
