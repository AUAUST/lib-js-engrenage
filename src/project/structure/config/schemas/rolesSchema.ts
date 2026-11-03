import { description, literal, pipe, union } from "valibot";

import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";

export const rolesSchema = pipe(
  union([literal(false), rolesOptionSchema]),
  description(
    "The roles of the project, refined by each environment. `false` turns the role system off: no role is recognized and no role check or rule is produced.",
  ),
);
