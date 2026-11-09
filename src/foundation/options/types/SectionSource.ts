import type { KeyedSection } from "#foundation/options/types/KeyedSection";
import type { Section } from "#foundation/options/types/Section";

export interface SectionSource {
  load(key: string): Promise<KeyedSection | undefined>;
  // @debt value reads map to keys through `keyOf` until every reader reads by key
  keyOf?(section: Section): Promise<string | undefined>;
}
