import { gitignoreFile } from "#constants";
import { declareLocation } from "#foundation/options/config/declareLocation";
import { declareObject } from "#foundation/options/utils/declareObject";

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
