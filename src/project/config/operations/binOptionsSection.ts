import { declareSection } from "#foundation/options/index";
import { runtimeSection } from "#project/config/operations/runtimeSection";
import { binSchema } from "#project/environments/index";

export const binOptionsSection = declareSection({
  name: "bin",
  declaration: binSchema,
  async resolve(input, config) {
    return binSchema.resolve(
      input,
      { runtime: await config.resolve(runtimeSection) },
      "bin",
    );
  },
});
