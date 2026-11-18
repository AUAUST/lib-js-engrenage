import type { InferOutput } from "valibot";

import type { linksSchema } from "#tools/pnpm/config/schemas/linksSchema";

export type Links = InferOutput<typeof linksSchema>;
