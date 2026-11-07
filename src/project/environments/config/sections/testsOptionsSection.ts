import { declareSection } from "#foundation/options/index";
import { testsSchema } from "#project/environments/config/schemas/testsSchema";
import { traitsSection } from "#project/presets/index";

export const testsOptionsSection = declareSection({
  name: "tests",
  declaration: testsSchema,
  async resolve(input, config) {
    const { published } = await config.resolve(traitsSection);

    return testsSchema.resolve(input, { published }, "tests");
  },
});
