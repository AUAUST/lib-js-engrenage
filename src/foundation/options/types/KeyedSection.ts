import type { Section } from "#foundation/options/types/Section";

export interface KeyedSection {
  readonly input: string | undefined;
  readonly section: Section;
}
