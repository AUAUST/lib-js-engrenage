import { declareSection } from "#foundation/options/index";
import { scriptsSchema } from "#project/environments/index";

export const scriptsOptionsSection = declareSection({
  name: "scripts",
  declaration: scriptsSchema,
  resolve(input) {
    return scriptsSchema.resolve(input, undefined, "scripts");
  },
});
