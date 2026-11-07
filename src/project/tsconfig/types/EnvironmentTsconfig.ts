import type { InferInput } from "valibot";

import type { declareEnvironmentTsconfig } from "#project/tsconfig/config/declarers/declareEnvironmentTsconfig";

export type EnvironmentTsconfig = Exclude<
  NonNullable<
    InferInput<ReturnType<typeof declareEnvironmentTsconfig>["schema"]>
  >,
  false
>;
