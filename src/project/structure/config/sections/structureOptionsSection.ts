import { declareSection } from "#foundation/options/index";
import { structureSchema } from "#project/structure/config/schemas/structureSchema";

export const structureOptionsSection = declareSection({
  name: "structure",
  declaration: structureSchema,
  resolve(input) {
    return structureSchema.resolve(input, undefined, "structure");
  },
});
