import { createFragmentSources } from "#metalbrain/facts/operations/createFragmentSources";
import type { FragmentExtension } from "#metalbrain/facts/types/FragmentExtension";
import type { MetalbrainFacts } from "#metalbrain/facts/types/MetalbrainFacts";
import type { WordCaps } from "#metalbrain/facts/types/WordCaps";

/**
 * Builds the manifest instructions render from, out of the config values it
 * states and the active extensions.
 */
export function createMetalbrainFacts({
  wordCaps,
  outputLimit,
  extensions,
}: {
  wordCaps: WordCaps;
  outputLimit: number;
  extensions: readonly FragmentExtension[];
}): MetalbrainFacts {
  return {
    wordCaps,
    outputLimit,
    fragments: createFragmentSources(extensions),
  };
}
