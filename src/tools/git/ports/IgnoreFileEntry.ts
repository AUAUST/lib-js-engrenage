import type { EntryShape } from "#foundation/extensions/index";
import type { Loadable } from "#foundation/modules/index";
import type { LoadedConfig } from "#project/config/index";
import type { IgnorePresets } from "#types/IgnorePresets";

/**
 * An ignore file whose `@ignore <preset>` blocks the `ignore` directive fills
 * with the presets its owner loads.
 *
 * @experimental
 */
export interface IgnoreFileEntry extends EntryShape {
  /**
   * The resource key of the ignore file, unique within the slot.
   */
  readonly name: string;
  /**
   * Loads the presets factory, resolved by `loadLazy`.
   */
  load(): Promise<Loadable<(config: LoadedConfig) => Promise<IgnorePresets>>>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "ignore.files": IgnoreFileEntry;
    }
  }
}
