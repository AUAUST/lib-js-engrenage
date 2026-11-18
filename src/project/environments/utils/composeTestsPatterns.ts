import { freeze } from "@auaust/toolkit/object";

import {
  distTestsVariant,
  sourceTestsVariant,
} from "#project/environments/constants";
import type { OutputOf } from "#foundation/options/index";
import type { testsSchema } from "#project/environments/config/schemas/testsSchema";
import type { ResolvedTestsPatterns } from "#project/environments/types/ResolvedTestsPatterns";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function composeTestsPatterns(
  option: OutputOf<typeof testsSchema>,
  extension?: Glob,
): ResolvedTestsPatterns {
  function pattern(variant: string): Globs {
    return option.enabled
      ? [
          `${option.location}${option.suffix}${variant}${extension ?? option.extension}`,
        ]
      : [];
  }

  return freeze({
    plain: pattern(""),
    source: pattern(sourceTestsVariant),
    dist: pattern(distTestsVariant),
  });
}
