import { array, pipe, readonly } from "valibot";

import { declare } from "#foundation/options/index";
import { roleSchema } from "#project/roles/config/schemas/roleSchema";

export const rolesSchema = declare(pipe(array(roleSchema.schema), readonly()), {
  description: "Roles added to the environment's default roles, a role replacing the default of its name.",
  optional: { value: [] },
});
