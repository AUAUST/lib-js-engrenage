import { flatMap } from "@auaust/toolkit/array";

import { withExtensions } from "#foundation/filesystem/index";
import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import type { ConfigResolver } from "#project/config/index";
import type { Glob } from "#types/Glob";

/**
 * The extension glob ending the test file patterns: `tests.extension`, else the
 * extensions of the languages the tests environment selects.
 */
export async function readTestsExtension(
  config: ConfigResolver,
): Promise<Glob> {
  const option = await config.resolve("tests.options");

  if (option.enabled && option.extension !== undefined) {
    return option.extension;
  }

  const languages = await readEnvironmentLanguages(config, "tests");

  return withExtensions(
    "",
    flatMap(languages, (language) => language.extensions),
  );
}
