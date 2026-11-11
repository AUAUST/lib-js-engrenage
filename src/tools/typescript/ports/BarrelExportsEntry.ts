import type { EntryShape } from "#foundation/extensions/index";
import type { BarrelExportsResolver } from "#tools/typescript/ports/BarrelExportsResolver";

/** @experimental */
export interface BarrelExportsEntry extends EntryShape {
  readonly name: string;
  load(): Promise<BarrelExportsResolver>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "barrels.exports": BarrelExportsEntry;
    }
  }
}
