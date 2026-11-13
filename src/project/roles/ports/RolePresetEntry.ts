import type { EntryShape } from "#foundation/extensions/index";
import type { Trait } from "#project/presets/index";

export interface RolePresetEntry extends EntryShape {
  /**
   * The name `from` exports the preset under.
   */
  readonly name: string;
  /**
   * The module specifier the generated config imports the preset from.
   */
  readonly from: string;
  /**
   * The environments `init` adds the role to in the config file it writes; empty,
   * it adds the role nowhere.
   */
  readonly environments: readonly string[];
  /**
   * Traits the project must all have for `init` to add the role.
   */
  readonly traits?: readonly Trait[];
}

declare global {
  namespace Engrenage {
    interface Slots {
      roles: RolePresetEntry;
    }
  }
}
