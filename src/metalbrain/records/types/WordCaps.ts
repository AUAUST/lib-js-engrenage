import type { WordCapKind } from "#metalbrain/records/types/WordCapKind";
import type { WordCapMode } from "#metalbrain/records/types/WordCapMode";

/**
 * Word cap of each text kind, with the mode reporting an overrun.
 */
export interface WordCaps extends Readonly<Record<WordCapKind, number>> {
  readonly mode: WordCapMode;
}
