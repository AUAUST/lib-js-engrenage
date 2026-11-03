import { description, optional, pipe } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { defaultScriptsDirectories } from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";

export const scriptsSchema = pipe(
  environmentSchema({
    ...createCodeEnvironment("scripts", defaultScriptsDirectories),
    roles: optional(rolesOptionSchema),
  }),
  description(
    join(
      [
        "The environment of the maintenance scripts of the project, never published.",
        "`false` disables it.",
      ],
      "\n",
    ),
  ),
);
