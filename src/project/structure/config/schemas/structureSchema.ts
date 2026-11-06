import { declareObject } from "#foundation/options/index";
import { effectsSchema } from "#project/structure/config/schemas/effectsSchema";

export const structureSchema = declareObject(
  {
    effects: effectsSchema,
  },
  {
    description: "Structure settings shared by every environment.",
    optional: true,
  },
);
