import type { ConfigKey } from "#project/config/index";
import type { ConventionSections } from "#tools/eslint/types/ConventionSections";
import type { ConventionValues } from "#tools/eslint/types/ConventionValues";

export interface ResolvedSections {
  has(key: ConfigKey): boolean;
  pick<Sections extends ConventionSections>(
    sections: Sections | undefined,
  ): ConventionValues<Sections>;
}
