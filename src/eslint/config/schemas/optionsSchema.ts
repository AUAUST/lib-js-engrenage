import { strictObject } from "valibot";

import { comparisonsSchema } from "#eslint/config/schemas/comparisonsSchema";
import { globalsSchema } from "#eslint/config/schemas/globalsSchema";
import { ignoreSchema } from "#eslint/config/schemas/ignoreSchema";
import { importsSchema } from "#eslint/config/schemas/importsSchema";
import { promisesSchema } from "#eslint/config/schemas/promisesSchema";
import { recommendedSchema } from "#eslint/config/schemas/recommendedSchema";
import { structureSchema } from "#eslint/config/schemas/structureSchema";
import { stylisticSchema } from "#eslint/config/schemas/stylisticSchema";

export const optionsSchema = strictObject({
  ignore: ignoreSchema,
  recommended: recommendedSchema,
  globals: globalsSchema,
  comparisons: comparisonsSchema,
  stylistic: stylisticSchema,
  imports: importsSchema,
  promises: promisesSchema,
  structure: structureSchema,
});
