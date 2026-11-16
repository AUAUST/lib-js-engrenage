import { toArray } from "@auaust/toolkit/array";

import { ensureAnyOf } from "#foundation/processes/utils/ensureAnyOf";

export function ensureIncludes(
  args: string[],
  option: string | readonly string[],
) {
  const tokens = toArray(option);

  ensureAnyOf(args, tokens.slice(0, 1), tokens);
}
