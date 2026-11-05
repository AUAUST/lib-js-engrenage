import { entries } from "@auaust/toolkit/object";

import type { OptionContext } from "#foundation/options/index";
import type { ResolvedDefine } from "#project/config/types/ResolvedDefine";

export async function createDefine(
  { get }: OptionContext<{ define: ResolvedDefine }>,
  { isTesting }: { isTesting: boolean },
): Promise<Record<string, string>> {
  const excludedScope = isTesting ? "build" : "test";

  const expressions: Record<string, string> = {};

  const define = await get("define");

  for (const [name, { expression, scope }] of entries(define.values)) {
    if (scope !== excludedScope) {
      expressions[name] = expression;
    }
  }

  return expressions;
}
