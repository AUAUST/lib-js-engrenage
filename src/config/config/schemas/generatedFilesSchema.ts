import { builtinGeneratedFiles } from "#config/constants/builtinGeneratedFiles";
import { globSchema } from "#config/config/schemas/globSchema";
import { array, optional, pipe, transform } from "valibot";

export const generatedFilesSchema = optional(
  pipe(
    array(globSchema),
    transform((files) => {
      return [...builtinGeneratedFiles, ...files];
    }),
  ),
  [],
);
