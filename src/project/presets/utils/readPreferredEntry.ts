import type { PresetEntry } from "#project/presets/ports/PresetEntry";

/**
 * Reads the entry name `preset` prefers in `slot`; `undefined` without a preset
 * or a preference for the slot.
 */
export function readPreferredEntry(
  preset: PresetEntry | false,
  slot: string,
): string | undefined {
  return preset === false ? undefined : preset.prefers?.[slot];
}
