import { declareSection } from "#foundation/options/index";
import { extensionsSchema } from "#project/config/config/schemas/extensionsSchema";

export const extensionsSection = declareSection({
  name: "extensions",
  declaration: extensionsSchema,
  resolve(input) {
    return extensionsSchema.resolve(input, undefined, "extensions");
  },
});
