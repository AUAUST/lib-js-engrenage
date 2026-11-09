import type { KeyedSection } from "#foundation/options/types/KeyedSection";

export interface SectionSource {
  load(key: string): Promise<KeyedSection | undefined>;
  refuse?(key: string): Promise<string | undefined>;
}
