import { entries } from "@auaust/toolkit/object";

import type { LoadedConfig } from "#project/config/index";

export async function createDefine(
  { resolve }: LoadedConfig,
  { isTesting }: { isTesting: boolean },
): Promise<Record<string, string>> {
  const excludedScope = isTesting ? "build" : "test";

  const expressions: Record<string, string> = {};

  const define = await resolve("define");

  for (const [name, { expression, scope }] of entries(define.values)) {
    if (scope !== excludedScope) {
      expressions[name] = expression;
    }
  }

  return expressions;
}
