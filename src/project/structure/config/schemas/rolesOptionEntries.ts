import { array, string } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { declareRecord } from "#foundation/options/utils/declareRecord";
import { roleContractSchema } from "#project/structure/config/schemas/roleContractSchema";
import { roleKeySchema } from "#project/structure/config/schemas/roleKeySchema";
import { roleNameSchema } from "#project/structure/config/schemas/roleNameSchema";

export const rolesOptionEntries = {
  enable: declare(array(roleKeySchema), {
    description:
      "Known roles to turn on, applied to the defaults before `define`.",
    optional: { value: [] },
  }),
  disable: declare(array(roleKeySchema), {
    description:
      "Known roles to turn off, applied to the defaults before `define`.",
    optional: { value: [] },
  }),
  define: declareRecord(roleNameSchema, roleContractSchema, {
    description:
      "Roles to define by name, applied last: a role that already exists is redefined whole, and a defined role is on unless it is scoped.",
    optional: {
      value: {},
    },
  }),
  aliases: declareRecord(string(), declare(string()), {
    description:
      "Directory names read as a role, mapped to the role name (`helpers` read as `utils`).",
    optional: {
      value: {},
    },
  }),
};
