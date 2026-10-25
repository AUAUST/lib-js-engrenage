import { sourceDirectoriesSchema } from "#config/config/schemas/sourceDirectoriesSchema";
import { testDirectoriesSchema } from "#config/config/schemas/testDirectoriesSchema";
import { optional, strictObject } from "valibot";

export const directoriesSchema = optional(
  strictObject({
    source: sourceDirectoriesSchema,
    test: testDirectoriesSchema,
  }),
  {},
);
