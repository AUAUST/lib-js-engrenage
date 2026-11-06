import { array, pipe, readonly } from "valibot";

import { declare } from "#foundation/options/index";
import { roleSchema } from "#project/roles/config/schemas/roleSchema";

export const rolesSchema = declare(pipe(array(roleSchema.schema), readonly()), {
  description: [
    "Roles of the directories and files whose names carry a fixed meaning, each built by a role preset of `@auaust/engrenage/roles` or `createRolePreset`.",
    "Only listed roles exist.",
  ],
  optional: { value: [] },
});
