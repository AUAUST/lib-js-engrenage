import { fileSchema } from "#foundation/options/config/schemas/fileSchema";
import { declare } from "#foundation/options/declarers/declare";
import { describeDefault } from "#foundation/options/utils/describeDefault";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { Description } from "#foundation/options/types/Description";
import type { ResolvedLocation } from "#foundation/options/types/ResolvedLocation";
import type { File } from "#types/File";

export function declareLocation(options: {
  description: Description;
  optional: { readonly value: File; readonly explain?: string };
  assert?(file: File): void;
}): Declaration<File | undefined, ResolvedLocation, unknown> {
  const { value } = options.optional;

  return declare(fileSchema, {
    description: options.description,
    optional: {
      explain: options.optional.explain ?? describeDefault({ value }),
      compute() {
        return { file: value, configured: false };
      },
    },
    adjust(input) {
      options.assert?.(input);

      return { file: input, configured: true };
    },
  });
}
