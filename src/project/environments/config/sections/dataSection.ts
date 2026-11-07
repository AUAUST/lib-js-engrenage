import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";

export const dataSection = declareSection({
  name: "data",
  declaration: dataSchema,
  resolve(input) {
    const option = dataSchema.resolve(input, undefined, "data");

    return freeze({
      active: option.enabled,
      dirs: option.dirs,
      exports: option.exports,
    });
  },
});
