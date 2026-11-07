import type { Section } from "#foundation/options/index";
import type { ConventionSections } from "#tools/eslint/types/ConventionSections";
import type { ConventionValues } from "#tools/eslint/types/ConventionValues";

export interface ResolvedSections {
  has(section: Section): boolean;
  pick<Sections extends ConventionSections>(
    sections: Sections | undefined,
  ): ConventionValues<Sections>;
}
