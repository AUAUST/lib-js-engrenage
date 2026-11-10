import type { Doc } from "prettier";

import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";

export function isParenthesized(target: Doc): boolean {
  if (isArray(target)) {
    return target[0] === "(" && target.at(-1) === ")";
  }

  return (
    isObject(target) &&
    target.type === "label" &&
    isParenthesized(target.contents)
  );
}
