import { declareSection, type OutputOf } from "#foundation/options/index";
import { formatSchema } from "#project/format/config/schemas/formatSchema";

export const formatSection = declareSection({
  declaration: formatSchema,
  resolve(input): OutputOf<typeof formatSchema> {
    return formatSchema.resolve(input, undefined, "format");
  },
});
