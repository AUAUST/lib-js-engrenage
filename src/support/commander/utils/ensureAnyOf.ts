import { wrap } from "@auaust/primitive-kit/arrays";

import { getOptionsEnd } from "#support/commander/utils/getOptionsEnd";
import { hasOption } from "#support/commander/utils/hasOption";

export function ensureAnyOf(
  args: string[],
  options: readonly string[],
  fallback: string | readonly string[],
) {
  if (!hasOption(args, options)) {
    args.splice(getOptionsEnd(args), 0, ...wrap(fallback));
  }
}
