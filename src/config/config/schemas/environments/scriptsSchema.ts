import { description, pipe } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { defaultScriptsDirectories } from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";

export const scriptsSchema = pipe(
  environmentSchema(
    createCodeEnvironment("scripts", defaultScriptsDirectories),
  ),
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
