import type { Section } from "#foundation/options/ports/Section";

export interface KeyedSection {
  readonly input: string | undefined;
  readonly section: Section;
}
