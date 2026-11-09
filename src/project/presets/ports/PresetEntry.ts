import type { EntryShape } from "#foundation/extensions/index";
import type { Trait } from "#project/presets/types/Trait";

export interface PresetEntry extends EntryShape {
  readonly name: string;
  readonly traits: readonly Trait[];
  load?(): Promise<Readonly<Record<string, unknown>>>;
}

declare global {
  interface EngrenageSlots {
    presets: PresetEntry;
  }

  interface EngrenagePresets {}
}
