import type { EntryShape } from "#foundation/extensions/index";
import type { Trait } from "#project/presets/index";

export interface RolePresetEntry extends EntryShape {
  readonly name: string;
  readonly from: string;
  readonly environments: readonly string[];
  readonly traits?: readonly Trait[];
}

declare global {
  interface EngrenageSlots {
    roles: RolePresetEntry;
  }
}
