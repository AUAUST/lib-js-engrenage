import { isString } from "@auaust/toolkit";

import { defaultEffectLevels } from "#batiment/effects/constants";
import type { DocTag } from "#project/docs/types/DocTag";

/**
 * The invocation level an effect doc tag declares, `undefined` for any other tag.
 */
export function readEffectLevel({ name, value }: DocTag): string | undefined {
  if (name === "effect") {
    return isString(value) ? value : undefined;
  }

  return defaultEffectLevels.find((level) => level === name);
}
