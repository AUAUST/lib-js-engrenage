import { array, pipe, readonly } from "valibot";

import { roleSchema } from "#batiment/roles/config/schemas/roleSchema";
import { declare } from "#foundation/options/index";

export const rolesSchema = declare(pipe(array(roleSchema.schema), readonly()), {
  description: "Roles added to the environment's default roles, a role replacing the default of its name.",
  optional: { value: [] },
});
