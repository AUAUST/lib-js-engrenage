import { wrap } from "@auaust/primitive-kit/arrays";

import { getOptionsEnd } from "#support/commander/utils/getOptionsEnd";
import { isOptionOf } from "#support/commander/utils/isOptionOf";

export function ensureAnyOf(
  args: string[],
  options: readonly string[],
  fallback: string | readonly string[],
) {
  const end = getOptionsEnd(args);

  const present = args.slice(0, end).some((arg) => {
    return isOptionOf(arg, options);
  });

  if (!present) {
    args.splice(end, 0, ...wrap(fallback));
  }
}
