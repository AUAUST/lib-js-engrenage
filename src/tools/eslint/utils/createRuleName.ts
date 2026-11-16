import { kebab } from "@auaust/toolkit";

export function createRuleName(convention: string): string {
  return kebab(convention);
}
