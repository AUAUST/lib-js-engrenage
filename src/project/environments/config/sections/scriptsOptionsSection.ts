import { declareSection, type OutputOf } from "#foundation/options/index";
import { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";

export const scriptsOptionsSection = declareSection({
  name: "scripts",
  declaration: scriptsSchema,
  resolve(input): OutputOf<typeof scriptsSchema> {
    return scriptsSchema.resolve(input, undefined, "scripts");
  },
});
