import { isPlainObject, isString } from "@auaust/toolkit";

export function resolveImportTarget(target: unknown): string | undefined {
  if (isString(target)) {
    return target;
  }

  return isPlainObject(target)
    ? resolveImportTarget(target.default)
    : undefined;
}
