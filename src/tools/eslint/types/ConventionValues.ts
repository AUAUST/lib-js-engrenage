import type { Section } from "#foundation/options/index";
import type { ConventionSections } from "#tools/eslint/types/ConventionSections";

export type ConventionValues<Sections extends ConventionSections> = {
  readonly [Name in keyof Sections]: Sections[Name] extends Section<
    infer Output
  >
    ? Output
    : never;
};
