import { wrap } from "@auaust/primitive-kit/arrays";

import { getOptionsEnd } from "#workflows/cli/utils/getOptionsEnd";
import { hasOption } from "#workflows/cli/utils/hasOption";

// @debt sits in `operations/` because it mutates its argument while importing only utils; effect levels rank imports, so nothing states whether mutation is an effect
export function ensureAnyOf(
  args: string[],
  options: readonly string[],
  fallback: string | readonly string[],
) {
  if (!hasOption(args, options)) {
    args.splice(getOptionsEnd(args), 0, ...wrap(fallback));
  }
}
