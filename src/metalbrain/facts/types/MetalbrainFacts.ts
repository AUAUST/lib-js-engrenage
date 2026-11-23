import type { FragmentSources } from "#metalbrain/facts/types/FragmentSources";
import type { WordCaps } from "#metalbrain/facts/types/WordCaps";

/**
 * The manifest instructions render from: the config values agents need and the
 * sources of instruction fragments.
 */
export interface MetalbrainFacts {
  readonly wordCaps: WordCaps;
  readonly outputLimit: number;
  readonly fragments: FragmentSources;
}
