import { lazy, type GenericSchema } from "valibot";

import { declareRoleContractEntries } from "#batiment/roles/config/declarers/declareRoleContractEntries";
import { roleNameSchema } from "#batiment/roles/config/schemas/roleNameSchema";
import { declare, declareObject } from "#foundation/options/index";
import type { Role } from "#batiment/roles/types/Role";

export const roleSchema = declareObject(
  {
    name: declare(roleNameSchema, {
      description: "Name of the role, unique in its list. A role nested in another is registered as `<owner>/<name>` and shadows a root role of the same name inside its owner only.",
    }),
    ...declareRoleContractEntries(
      lazy((): GenericSchema<Role> => roleSchema.schema),
    ),
  },
  {
    description: "A role: its `name` and contract, usually built by a role preset.",
  },
);
