import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { testsSchema } from "#project/environments/config/schemas/testsSchema";
import { traitsSection } from "#project/presets/index";
import { unmanagedTsconfig } from "#project/tsconfig/index";

export const testsOptionsSection = declareSection({
  name: "tests",
  declaration: testsSchema,
  async resolve(input, config) {
    const option = testsSchema.resolve(input, undefined, "tests");

    const configured =
      isPlainObject(input) &&
      isPlainObject(input.dist) &&
      input.dist.tsconfig !== undefined;

    const { published } = await config.resolve(traitsSection);

    return configured || published
      ? option
      : freeze({
          ...option,
          dist: freeze({ ...option.dist, tsconfig: unmanagedTsconfig }),
        });
  },
});
