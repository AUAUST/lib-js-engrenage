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
  // @debt keyed by any slot, but only `build.tools` reads it while `format.formatters` ignores it; slot and entry names are plain strings, so a typo is silently ignored
  /**
   * Entry names by slot: the entry picked when its slot's key is unset and
   * the entry is active.
   */
  readonly prefers?: Readonly<Record<string, string>>;
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
