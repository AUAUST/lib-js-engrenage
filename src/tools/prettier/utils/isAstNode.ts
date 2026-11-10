import { isObject } from "@auaust/toolkit/isObject";
import { isString } from "@auaust/toolkit/isString";

import type { AstNode } from "#tools/prettier/types/AstNode";

export function isAstNode(value: unknown): value is AstNode {
  return isObject(value) && "type" in value && isString(value.type);
}
