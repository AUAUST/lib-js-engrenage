import { prettierignoreFile } from "#constants";
import { declareLocation } from "#foundation/options/config/declareLocation";
import { declareObject } from "#foundation/options/utils/declareObject";

export const prettierSchema = declareObject(
  {
    prettierignore: declareLocation({
      description:
        "The `.prettierignore` file that sync updates with the generated paths.",
      optional: { value: prettierignoreFile },
    }),
  },
  {
    optional: true,
  },
);
