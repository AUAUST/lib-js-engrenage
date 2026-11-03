import type { InferOutput } from "valibot";

import type { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";

export type RolesOption = InferOutput<typeof rolesOptionSchema>;
