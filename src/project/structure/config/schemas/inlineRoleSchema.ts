import { lazy, type GenericSchema } from "valibot";

import { declare, declareObject } from "#foundation/options/index";
import { declareRoleContractEntries } from "#project/structure/config/schemas/declareRoleContractEntries";
import { roleNameSchema } from "#project/structure/config/schemas/roleNameSchema";
import type { InlineRole } from "#project/structure/types/InlineRole";

export const inlineRoleSchema = declareObject(
  {
    name: declare(roleNameSchema, {
      description:
        "Name of the role, local to its owner: it is registered as `<owner>/<name>` and shadows a root role of the same name inside the owner only.",
    }),
    ...declareRoleContractEntries(
      lazy((): GenericSchema<InlineRole> => inlineRoleSchema.schema),
    ),
  },
  {
    description:
      "A role defined inline in a role list: a contract with its `name`, always scoped.",
  },
);
