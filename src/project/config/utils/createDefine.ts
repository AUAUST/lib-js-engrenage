import { entries } from "@auaust/toolkit/object";

import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { ResolvedDefine } from "#project/config/types/ResolvedDefine";

export function createDefine(
  { get }: OptionContext<{ define: ResolvedDefine }>,
  { isTesting }: { isTesting: boolean },
): Record<string, string> {
  const excludedScope = isTesting ? "build" : "test";

  const expressions: Record<string, string> = {};

  for (const [name, { expression, scope }] of entries(get("define").values)) {
    if (scope !== excludedScope) {
      expressions[name] = expression;
    }
  }

  return expressions;
}
