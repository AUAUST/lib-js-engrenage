import { entries } from "@auaust/toolkit/object";

import { defineSection } from "#project/environments/config/sections/defineSection";
import type { LoadedConfig } from "#project/config/index";

export async function createDefine(
  { resolve }: LoadedConfig,
  { isTesting }: { isTesting: boolean },
): Promise<Record<string, string>> {
  const excludedScope = isTesting ? "build" : "test";

  const expressions: Record<string, string> = {};

  const define = await resolve(defineSection);

  for (const [name, { expression, scope }] of entries(define.values)) {
    if (scope !== excludedScope) {
      expressions[name] = expression;
    }
  }

  return expressions;
}
