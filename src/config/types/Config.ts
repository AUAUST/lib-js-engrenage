import type { InferInput } from "valibot";

import type { configSchema } from "#config/config/schemas/configSchema";

export type Config = InferInput<typeof configSchema>;
