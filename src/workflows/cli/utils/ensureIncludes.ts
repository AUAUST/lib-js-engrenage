import { wrap } from "@auaust/primitive-kit/arrays";

import { ensureAnyOf } from "#cli/utils/ensureAnyOf";

export function ensureIncludes(
  args: string[],
  option: string | readonly string[],
) {
  const tokens = wrap(option);

  ensureAnyOf(args, tokens.slice(0, 1), tokens);
}
