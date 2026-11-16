import { isObject, isString } from "@auaust/toolkit";

import type { AstNode } from "#tools/prettier/types/AstNode";

export function isAstNode(value: unknown): value is AstNode {
  return isObject(value) && "type" in value && isString(value.type);
}
