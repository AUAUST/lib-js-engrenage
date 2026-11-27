import type { InferOutput } from "valibot";

import { isString } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import type { effectCeilingsSchema } from "#batiment/effects/config/schemas/effectCeilingsSchema";
import type { EffectCeilings } from "#batiment/effects/types/EffectCeilings";

/**
 * The evaluation and invocation ceilings `stated` sets, a single level
 * setting both.
 */
export function resolveEffectCeilings(
  stated: InferOutput<typeof effectCeilingsSchema> | undefined,
): EffectCeilings {
  return isString(stated)
    ? freeze({
        evaluation: stated,
        invocation: stated,
      })
    : freeze({
        evaluation: stated?.evaluation,
        invocation: stated?.invocation,
      });
}
