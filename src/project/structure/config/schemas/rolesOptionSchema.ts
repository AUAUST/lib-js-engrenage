import {
  array,
  description,
  optional,
  pipe,
  record,
  strictObject,
  string,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { roleContractSchema } from "#project/structure/config/schemas/roleContractSchema";
import { roleKeySchema } from "#project/structure/config/schemas/roleKeySchema";

export const rolesOptionSchema = pipe(
  strictObject({
    enable: optional(
      pipe(
        array(roleKeySchema),
        description(
          "Known roles to turn on, applied to the defaults before `define`.",
        ),
      ),
    ),
    disable: optional(
      pipe(
        array(roleKeySchema),
        description(
          "Known roles to turn off, applied to the defaults before `define`.",
        ),
      ),
    ),
    define: optional(
      pipe(
        record(string(), roleContractSchema),
        description(
          join(
            [
              "Roles to define by name, applied last: a role that already exists is redefined whole, and a defined role is on unless it is scoped.",
              "@default none",
            ],
            "\n",
          ),
        ),
      ),
    ),
    aliases: optional(
      pipe(
        record(string(), string()),
        description(
          "Directory names read as a role, mapped to the role name (`helpers` read as `utils`).",
        ),
      ),
    ),
  }),
  description(
    "Roles of the directories and files whose names carry a fixed meaning.",
  ),
);
