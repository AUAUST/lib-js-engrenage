import type { RolePreset } from "#batiment/roles/index";
import type { EntryShape } from "#foundation/extensions/index";
import type { Loadable } from "#foundation/modules/index";
import type { Trait } from "#project/presets/index";

export interface RolePresetEntry extends EntryShape {
  /**
   * The name of the role the preset creates.
   */
  readonly name: string;
  /**
   * Loads the preset.
   */
  load(): Promise<Loadable<RolePreset>>;
  /**
   * The environment kinds the role is a default role of.
   */
  readonly environments: readonly string[];
  /**
   * Traits the project must all have for the role to be a default.
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
