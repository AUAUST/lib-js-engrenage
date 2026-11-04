import { array, string } from "valibot";

import {
  declare,
  declareObject,
  declareRecord,
  unset,
} from "#foundation/options/index";
import { effectLevelsSchema } from "#project/structure/config/schemas/effectLevelsSchema";
import { effectModulesSchema } from "#project/structure/config/schemas/effectModulesSchema";
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
  effects: declareObject(
    {
      levels: declare(effectLevelsSchema, {
        description:
          "Effect levels, purest first, compared by index. They must contain `pure`, `confined` and `effectful` in that order and may add levels anywhere around them.",
        optional: unset("`pure`, `confined`, `effectful`"),
      }),
      modules: declare(effectModulesSchema, {
        description:
          "Levels of external modules, as a record of specifier glob to level or a function from a specifier to a level or `undefined`. A module is ranked by the environment's entry, then the project's, then the built-in ranking of `node:*` builtins, then `fallback`.",
        optional: unset("none, so only the built-in ranking applies"),
      }),
      fallback: declare(string(), {
        description:
          "Level of an external module that nothing else ranks. Unset, such a module is unchecked.",
        optional: unset("none, so unranked modules are unchecked"),
      }),
    },
    {
      description:
        "Effect levels of roles and of the external modules they import. An environment refines the project's entries.",
      optional: true,
    },
  ),
};
