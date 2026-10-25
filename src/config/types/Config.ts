import type { configSchema } from "#config/config/schemas/configSchema";
import type { InferInput } from "valibot";

export type Config = InferInput<typeof configSchema>;
