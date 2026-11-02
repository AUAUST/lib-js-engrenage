import { description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { fileSchema } from "#config/config/schemas/values/fileSchema";

export const prettierSchema = strictObject({
  prettierignore: optional(
    pipe(
      fileSchema,
      description(
        join(
          [
            "The `.prettierignore` file that sync updates with the generated paths.",
            "@default `.prettierignore`",
          ],
          "\n",
        ),
      ),
    ),
  ),
});
