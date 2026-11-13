import type { EntryShape } from "#foundation/extensions/index";
import type { Trait } from "#project/presets/types/Trait";

export interface PresetEntry extends EntryShape {
  /**
   * The `preset` value selecting this preset.
   */
  readonly name: string;
  /**
   * The traits the preset turns on, before the `traits` adjustments.
   */
  readonly traits: readonly Trait[];
  /**
   * Loads config defaults by dotted input path, under the project's own values;
   * called once per preset. A path within `preset` or `extensions` fails the
   * config. Without it, the preset sets no defaults.
   */
  load?(): Promise<Readonly<Record<string, unknown>>>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      presets: PresetEntry;
    }

    interface Presets {}
  }
}
