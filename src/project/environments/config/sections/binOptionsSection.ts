import { declareSection } from "#foundation/options/index";
import { binSchema } from "#project/environments/config/schemas/binSchema";
import { runtimeSection } from "#project/environments/config/sections/runtimeSection";

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
