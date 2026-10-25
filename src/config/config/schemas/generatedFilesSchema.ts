import { array, optional, pipe, transform } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import { builtinGeneratedFiles } from "#config/constants";

export const generatedFilesSchema = optional(
  pipe(
    array(globSchema),
    transform((files) => {
      return [...builtinGeneratedFiles, ...files];
    }),
  ),
  [],
);
