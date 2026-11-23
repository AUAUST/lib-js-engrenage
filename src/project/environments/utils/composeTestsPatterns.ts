import { freeze, getOwn } from "@auaust/toolkit/object";

import { testVariants } from "#project/environments/constants";
import { composeVariantPatterns } from "#project/environments/utils/composeVariantPatterns";
import type { OutputOf } from "#foundation/options/index";
import type { testsSchema } from "#project/environments/config/schemas/testsSchema";
import type { ResolvedTestsPatterns } from "#project/environments/types/ResolvedTestsPatterns";
import type { Glob } from "#types/Glob";

export function composeTestsPatterns(
  option: OutputOf<typeof testsSchema>,
  extension?: Glob,
): ResolvedTestsPatterns {
  const patterns = composeVariantPatterns(option, testVariants, extension);

  return freeze({
    plain: getOwn(patterns, "plain") ?? [],
    source: getOwn(patterns, "src") ?? [],
    dist: getOwn(patterns, "dist") ?? [],
  });
}
