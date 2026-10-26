import { wrap } from "@auaust/primitive-kit/arrays";

import { getOptionsEnd } from "#support/commander/utils/getOptionsEnd";
import { isOptionOf } from "#support/commander/utils/isOptionOf";

export function ensureUnset(
  args: string[],
  options: string | readonly string[],
) {
  const unset = wrap(options);

  for (let index = getOptionsEnd(args) - 1; index >= 0; index--) {
    if (isOptionOf(args[index], unset)) {
      args.splice(index, 1);
    }
  }
}
