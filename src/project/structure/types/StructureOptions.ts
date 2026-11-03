import type { InferOutput, StrictObjectSchema } from "valibot";

import type { structureOptions } from "#project/structure/config/schemas/structureOptions";

export type StructureOptions = InferOutput<
  StrictObjectSchema<typeof structureOptions, undefined>
>;
