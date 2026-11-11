import type { SectionsOf } from "#project/config/types/SectionsOf";

import type * as builtins from "#workflows/builtins/entry";

declare global {
  namespace Engrenage {
    interface Sections extends SectionsOf<typeof builtins> {}
  }
}

export type ConfigSections = Engrenage.Sections;
