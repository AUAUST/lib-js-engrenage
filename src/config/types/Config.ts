import type { InferInput } from "valibot";

import type { configSchema } from "#config/config/schemas/configSchema";

export interface Config extends InferInput<typeof configSchema> {}
