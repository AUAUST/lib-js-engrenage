import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { runtimeSchema } from "#project/environments/config/schemas/runtimeSchema";
import type { ResolvedRuntimeSettings } from "#project/config/index";

export const runtimeSection = declareSection({
  declaration: runtimeSchema,
  resolve(input): ResolvedRuntimeSettings {
    const { node } = runtimeSchema.resolve(input, undefined, "runtime");

    return freeze({ node });
  },
});
