import { declareSection } from "#foundation/options/index";
import { selectEntry, type ConfigResolver } from "#project/config/index";
import { formatSchema } from "#project/format/config/schemas/formatSchema";
import type { FormatterEntry } from "#project/format/ports/FormatterEntry";

export const formatterSection = declareSection({
  declaration: formatSchema,
  resolve(input, config: ConfigResolver): Promise<FormatterEntry | false> {
    return selectEntry(config, "format.formatters", {
      key: "format.formatter",
      name: formatSchema.entries.formatter.resolve(
        input?.formatter,
        undefined,
        "format.formatter",
      ),
    });
  },
});
