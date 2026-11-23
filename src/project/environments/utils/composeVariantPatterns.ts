import { freeze, record } from "@auaust/toolkit/object";

import type { TestVariant } from "#batiment/scopes/index";
import type { OutputOf } from "#foundation/options/index";
import type { testsSchema } from "#project/environments/config/schemas/testsSchema";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

/**
 * Composes the file patterns of each test variant by name, from the tests
 * options' location, suffix and extension around the variant's marker; none
 * while tests are disabled.
 */
export function composeVariantPatterns(
  option: OutputOf<typeof testsSchema>,
  variants: readonly TestVariant[],
  extension?: Glob,
): Readonly<Partial<Record<string, Globs>>> {
  return freeze(
    record(
      variants.map(({ name, marker }) => {
        const globs: Globs = option.enabled
          ? freeze([
              `${option.location}${option.suffix}${marker}${extension ?? option.extension}`,
            ])
          : freeze([]);

        return [name, globs] as const;
      }),
    ),
  );
}
