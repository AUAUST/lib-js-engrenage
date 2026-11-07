import { declareSection } from "#foundation/options/index";
import { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";

export const scriptsOptionsSection = declareSection({
  name: "scripts",
  declaration: scriptsSchema,
  resolve(input) {
    return scriptsSchema.resolve(input, undefined, "scripts");
  },
});
