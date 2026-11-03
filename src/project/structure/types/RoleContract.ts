import type { InferOutput } from "valibot";

import type { roleContractSchema } from "#project/structure/config/schemas/roleContractSchema";

export type RoleContract = InferOutput<typeof roleContractSchema>;
