import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { dataSchema } from "#project/environments/index";
import { noRoles } from "#project/structure/constants";

export const dataSection = declareSection({
  name: "data",
  declaration: dataSchema,
  resolve(input) {
    const option = dataSchema.resolve(input, undefined, "data");

    return freeze({
      active: option.enabled,
      roles: noRoles,
      dirs: option.dirs,
      exports: option.exports,
    });
  },
});
