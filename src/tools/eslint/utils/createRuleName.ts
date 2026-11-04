import { toKebabCase } from "@auaust/primitive-kit/strings";

export function createRuleName(convention: string): string {
  return toKebabCase(convention);
}
