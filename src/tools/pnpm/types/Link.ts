import type { InferOutput } from "valibot";

import type { linkSchema } from "#tools/pnpm/config/schemas/linkSchema";

export type Link = InferOutput<typeof linkSchema>;
