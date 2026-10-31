import type { InferOutput } from "valibot";

import type { environmentTsconfigSchema } from "#config/config/schemas/environmentTsconfigSchema";

export type EnvironmentTsconfig = Exclude<
  InferOutput<typeof environmentTsconfigSchema>,
  false
>;
