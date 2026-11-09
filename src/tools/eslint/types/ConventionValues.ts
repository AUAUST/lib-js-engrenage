import type { ConfigSections } from "#project/config/index";
import type { ConventionSections } from "#tools/eslint/types/ConventionSections";

export type ConventionValues<Sections extends ConventionSections> = {
  readonly [Name in keyof Sections]: ConfigSections[Sections[Name]];
};
