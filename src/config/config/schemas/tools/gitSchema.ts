import { description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { fileSchema } from "#config/config/schemas/values/fileSchema";

export const gitSchema = strictObject({
  gitignore: optional(
    pipe(
      fileSchema,
      description(
        join(
          [
            "The `.gitignore` file that sync updates with the generated and built paths, and that ESLint reads to skip files.",
            "@default `.gitignore`",
          ],
          "\n",
        ),
      ),
    ),
  ),
});
