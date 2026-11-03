import { declareLocation } from "#config/utils/declareLocation";
import { prettierignoreFile } from "#constants";
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
