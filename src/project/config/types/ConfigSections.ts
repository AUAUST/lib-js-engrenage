import type { SectionsOf } from "#project/config/types/SectionsOf";

import type * as builtins from "#workflows/builtins/entry";

declare global {
  interface EngrenageSections extends SectionsOf<typeof builtins> {}
}

export type ConfigSections = EngrenageSections;
