import { wrap } from "@auaust/primitive-kit/arrays";

import { ensureAnyOf } from "#support/commander/utils/ensureAnyOf";

export function ensureIncludes(
  args: string[],
  option: string | readonly string[],
) {
  const tokens = wrap(option);

  ensureAnyOf(args, tokens.slice(0, 1), tokens);
}
