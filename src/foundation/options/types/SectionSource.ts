import type { MaybePromise } from "@auaust/toolkit/types";

import type { Resolver } from "#foundation/options/apis/Resolver";
import type { KeyedSection } from "#foundation/options/types/KeyedSection";

export interface SectionSource<Context = unknown> {
  load(key: string): MaybePromise<KeyedSection | undefined>;
  refuse?(key: string, reader: Resolver<Context>): Promise<string | undefined>;
}
