import { declareSection, type OutputOf } from "#foundation/options/index";
import { testsSchema } from "#project/environments/config/schemas/testsSchema";
import type { ConfigResolver } from "#project/config/index";

export const testsOptionsSection = declareSection({
  name: "tests",
  declaration: testsSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<OutputOf<typeof testsSchema>> {
    const { published } = await config.resolve("traits");

    return testsSchema.resolve(input, { published }, "tests");
  },
});
