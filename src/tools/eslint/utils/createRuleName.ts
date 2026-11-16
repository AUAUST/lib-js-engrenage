import { toKebabCase } from "@auaust/toolkit/string";

export function createRuleName(convention: string): string {
  return toKebabCase(convention);
}
