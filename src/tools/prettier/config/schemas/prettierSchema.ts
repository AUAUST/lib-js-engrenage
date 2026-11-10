import { prettierignoreFile } from "#constants";
import { declareLocation, declareObject } from "#foundation/options/index";

export const prettierSchema = declareObject(
  {
    prettierignore: declareLocation({
      description: "The `.prettierignore` file that sync updates with the generated paths.",
      optional: { value: prettierignoreFile },
    }),
  },
  {
    optional: true,
  },
);
