import type { Settings } from "eslint-plugin-boundaries";

import type { BoundaryRules } from "#tools/eslint/types/BoundaryRules";

export interface Boundaries {
  readonly settings: Settings;
  readonly rules: BoundaryRules;
}
