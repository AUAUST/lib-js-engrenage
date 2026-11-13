import type { EntryShape } from "#foundation/extensions/index";
import type { BarrelExportsResolver } from "#tools/typescript/ports/BarrelExportsResolver";

/**
 * @experimental
 */
export interface BarrelExportsEntry extends EntryShape {
  /**
   * Name of the resolver, unique across the slot and quoted in validation errors.
   */
  readonly name: string;
  /**
   * Loads the resolver once per barrel sync; resolvers run in contribution order,
   * each receiving the exports the previous one returned.
   */
  load(): Promise<BarrelExportsResolver>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "barrels.exports": BarrelExportsEntry;
    }
  }
}
