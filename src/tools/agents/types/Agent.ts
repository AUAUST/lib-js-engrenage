import type { InferOutput } from "valibot";

import type { preferredSchema } from "#project/config/config/schemas/values/preferredSchema";

export type Agent = InferOutput<typeof preferredSchema>[number];
