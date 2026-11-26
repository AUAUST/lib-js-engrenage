import { toDeduplicated } from "@auaust/toolkit/array";

import type { LanguageEntry } from "#project/environments/index";

/**
 * The extensions of `languages` whose files are modules, in their order.
 */
export function listModuleExtensions(
  languages: readonly LanguageEntry[],
): readonly string[] {
  return toDeduplicated(
    languages
      .filter((language) => language.modules === true)
      .flatMap((language) => language.extensions),
  );
}
