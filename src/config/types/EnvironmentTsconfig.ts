import type { InferInput } from "valibot";

import type { declareEnvironmentTsconfig } from "#config/utils/declareEnvironmentTsconfig";

export type EnvironmentTsconfig = Exclude<
  NonNullable<
    InferInput<ReturnType<typeof declareEnvironmentTsconfig>["schema"]>
  >,
  false
>;
