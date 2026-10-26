import { isArray } from "@auaust/toolkit/isArray";

import { ensureAnyOf } from "#support/commander/utils/ensureAnyOf";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";

export function ensureIncludesAll(
  args: string[],
  options: readonly (string | readonly string[])[],
) {
  for (const option of options) {
    if (isArray(option)) {
      ensureAnyOf(args, option, option[0]);
    } else {
      ensureIncludes(args, option);
    }
  }
}
