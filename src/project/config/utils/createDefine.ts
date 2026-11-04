import { entries } from "@auaust/toolkit/object";

import type { ProjectConfig } from "#project/config/types/ProjectConfig";

export function createDefine(
  { define }: ProjectConfig,
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
