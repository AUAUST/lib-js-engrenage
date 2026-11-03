import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";

export function resolveImportTarget(target: unknown): string | undefined {
  if (isString(target)) {
    return target;
  }

  return isPlainObject(target)
    ? resolveImportTarget(target.default)
    : undefined;
}
