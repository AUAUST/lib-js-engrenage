import { declareSection, type OutputOf } from "#foundation/options/index";
import { structureSchema } from "#project/structure/config/schemas/structureSchema";

export const structureOptionsSection = declareSection({
  name: "structure",
  declaration: structureSchema,
  resolve(input): OutputOf<typeof structureSchema> {
    return structureSchema.resolve(input, undefined, "structure");
  },
});
