import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { runtimeSchema } from "#project/environments/index";
import type { ResolvedRuntimeSettings } from "#project/config/types/ResolvedRuntimeSettings";

export const runtimeSection = declareSection({
  name: "runtime",
  declaration: runtimeSchema,
  resolve(input): ResolvedRuntimeSettings {
    const { node } = runtimeSchema.resolve(input, undefined, "runtime");

    return freeze({ node });
  },
});
