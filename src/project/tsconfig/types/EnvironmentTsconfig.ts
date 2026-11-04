import type { InferInput } from "valibot";

import type { declareEnvironmentTsconfig } from "#tsconfig/config/declareEnvironmentTsconfig";

export type EnvironmentTsconfig = Exclude<
  NonNullable<
    InferInput<ReturnType<typeof declareEnvironmentTsconfig>["schema"]>
  >,
  false
>;
