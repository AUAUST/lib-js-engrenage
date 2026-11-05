import { createBoundaryPolicies } from "#tools/eslint/utils/createBoundaryPolicies";
import { createBoundarySettings } from "#tools/eslint/utils/createBoundarySettings";
import type { Boundaries } from "#tools/eslint/types/Boundaries";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";

const cache = new WeakMap<ConventionConfig, Boundaries>();

export function resolveBoundaries(config: ConventionConfig): Boundaries {
  let boundaries = cache.get(config);

  if (boundaries === undefined) {
    boundaries = {
      settings: createBoundarySettings(config),
      rules: createBoundaryPolicies(config),
    };

    cache.set(config, boundaries);
  }

  return boundaries;
}
