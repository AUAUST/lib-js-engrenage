import { gitignoreFile } from "#constants";
import { declareLocation, declareObject } from "#foundation/options/index";

export const gitSchema = declareObject(
  {
    gitignore: declareLocation({
      description:
        "The `.gitignore` file that sync updates with the generated and built paths, and that ESLint reads to skip files.",
      optional: { value: gitignoreFile },
    }),
  },
  {
    optional: true,
  },
);
