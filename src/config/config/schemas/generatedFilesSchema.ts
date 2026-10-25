import { globSchema } from "#config/config/schemas/globSchema";
import { array, optional, pipe, transform } from "valibot";

export const generatedFilesSchema = optional(
  pipe(
    array(globSchema),
    transform((files) => {
      return [
        "pnpm-lock.yaml",
        "package-lock.json",
        "yarn.lock",
        "bun.lock",
        "bun.lockb",
        "coverage/**",
        ...files,
      ];
    }),
  ),
  [],
);
