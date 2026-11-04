import type { InferOutput } from "valibot";

import type { preferredSchema } from "#tools/agents/config/schemas/preferredSchema";

export type Agent = InferOutput<typeof preferredSchema>[number];
