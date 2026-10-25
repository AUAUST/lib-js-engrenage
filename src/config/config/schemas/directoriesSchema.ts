import { optional, strictObject } from "valibot";

import { sourceDirectoriesSchema } from "#config/config/schemas/sourceDirectoriesSchema";
import { testDirectoriesSchema } from "#config/config/schemas/testDirectoriesSchema";

export const directoriesSchema = optional(
  strictObject({
    source: sourceDirectoriesSchema,
    test: testDirectoriesSchema,
  }),
  {},
);
