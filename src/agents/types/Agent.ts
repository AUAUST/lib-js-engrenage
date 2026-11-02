import type { InferOutput } from "valibot";

import type { preferredSchema } from "#config/config/schemas/tools/agentsSchema";

export type Agent = InferOutput<typeof preferredSchema>[number];
