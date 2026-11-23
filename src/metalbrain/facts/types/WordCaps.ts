import type { WordCapKind } from "#metalbrain/facts/types/WordCapKind";
import type { WordCapMode } from "#metalbrain/facts/types/WordCapMode";

/**
 * Word cap of each text kind, with the mode reporting an overrun.
 */
export interface WordCaps extends Readonly<Record<WordCapKind, number>> {
  readonly mode: WordCapMode;
}
