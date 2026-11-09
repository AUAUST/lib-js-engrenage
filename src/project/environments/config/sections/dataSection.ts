import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import type { ResolvedData } from "#project/environments/types/ResolvedData";

export const dataSection = declareSection({
  name: "data",
  declaration: dataSchema,
  resolve(input): ResolvedData {
    const option = dataSchema.resolve(input, undefined, "data");

    return freeze({
      active: option.enabled,
      dirs: option.dirs,
      exports: option.exports,
    });
  },
});
