import { createBoundaryPolicies } from "#tools/eslint/utils/createBoundaryPolicies";
import { createBoundarySettings } from "#tools/eslint/utils/createBoundarySettings";
import type { ProjectConfig } from "#project/config/index";
import type { Boundaries } from "#tools/eslint/types/Boundaries";

const cache = new WeakMap<ProjectConfig, Boundaries>();

export function resolveBoundaries(config: ProjectConfig): Boundaries {
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
