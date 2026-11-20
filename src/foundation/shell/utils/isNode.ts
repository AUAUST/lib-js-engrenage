import type { Node } from "sh-syntax";

import { isObject, isString } from "@auaust/toolkit";

export function isNode(value: unknown): value is Node {
  return isObject(value) && isString(Reflect.get(value, "type"));
}
