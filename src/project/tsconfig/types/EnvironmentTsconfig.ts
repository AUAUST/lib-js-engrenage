import type { InferInput } from "valibot";

import type { declareEnvironmentTsconfig } from "#tsconfig/utils/declareEnvironmentTsconfig";

export type EnvironmentTsconfig = Exclude<
  NonNullable<
    InferInput<ReturnType<typeof declareEnvironmentTsconfig>["schema"]>
  >,
  false
>;
