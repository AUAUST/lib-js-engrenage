import { entries } from "@auaust/toolkit/object";

import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function createDefine(
  { define }: ResolvedConfig,
  { isTesting }: { isTesting: boolean },
): Record<string, string> {
  const excludedScope = isTesting ? "build" : "test";

  const expressions: Record<string, string> = {};

  for (const [name, { expression, scope }] of entries(define.values)) {
    if (scope !== excludedScope) {
      expressions[name] = expression;
    }
  }

  return expressions;
}
