import type { KeyedSection } from "#foundation/options/types/KeyedSection";
import type { Resolver } from "#foundation/options/types/Resolver";

export interface SectionSource<Context = unknown> {
  load(key: string): Promise<KeyedSection | undefined>;
  refuse?(key: string, reader: Resolver<Context>): Promise<string | undefined>;
}
