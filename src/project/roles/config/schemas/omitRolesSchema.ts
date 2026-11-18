import { array, pipe, readonly, string } from "valibot";

import { declare } from "#foundation/options/index";

export const omitRolesSchema = declare(pipe(array(string()), readonly()), {
  description: "Names of default roles the environment drops.",
  optional: { value: [] },
});
