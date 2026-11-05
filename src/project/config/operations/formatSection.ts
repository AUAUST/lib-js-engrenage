import { declareSection } from "#foundation/options/index";
import { formatSchema } from "#project/format/index";

export const formatSection = declareSection({
  name: "format",
  declaration: formatSchema,
  resolve(input) {
    return formatSchema.resolve(input, undefined, "format");
  },
});
