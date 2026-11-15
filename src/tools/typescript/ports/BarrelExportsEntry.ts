import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { BarrelExportsResolver } from "#tools/typescript/ports/BarrelExportsResolver";

/**
 * A barrel exports resolver, loaded once per barrel sync; resolvers run in
 * contribution order, each receiving the exports the previous one returned.
 *
 * @experimental
 */
export interface BarrelExportsEntry
  extends EntryShape, Lazy<BarrelExportsResolver> {
  /**
   * Name of the resolver, unique across the slot and quoted in validation errors.
   */
  readonly name: string;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "barrels.exports": BarrelExportsEntry;
    }
  }
}
