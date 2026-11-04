import type { InferInput } from "valibot";

import type { roleContractSchema } from "#structure/config/schemas/roleContractSchema";

export type RoleContract = InferInput<(typeof roleContractSchema)["schema"]>;
