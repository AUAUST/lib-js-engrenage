import { freeze } from "@auaust/toolkit/object";

import type { TagDeclaration } from "#project/docs/types/TagDeclaration";
import type { TagPreset } from "#project/docs/types/TagPreset";

/**
 * @experimental
 */
export function createTagPreset(defaults: TagDeclaration): TagPreset {
  return function preset(options = {}) {
    return freeze({ ...defaults, ...options });
  };
}
