import { declareLocation } from "#config/config/declareLocation";
import { gitignoreFile } from "#constants";
import { declareObject } from "#options/utils/declareObject";

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
