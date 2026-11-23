import { wordCapKinds } from "#metalbrain/facts/constants";
import { wordCapLabels } from "#metalbrain/instructions/constants";
import type { WordCapKind, WordCaps } from "#metalbrain/facts/index";
import type { BlockFillers } from "#types/BlockFillers";

function isWordCapKind(kind: string): kind is WordCapKind {
  return wordCapKinds.some((known) => known === kind);
}

/**
 * Fills a block with a table of the word caps of the kinds it names, in the order
 * given, or of every kind when it names none.
 */
export function createWordCapsFiller(wordCaps: WordCaps): BlockFillers[string] {
  return (...kinds) => {
    const unknown = kinds.filter((kind) => !isWordCapKind(kind));

    if (unknown.length > 0) {
      throw new Error(
        `Unknown word cap kind ${unknown.join(", ")}, expected one of: ${wordCapKinds.join(", ")}`,
      );
    }

    const named = kinds.length === 0
      ? wordCapKinds
      : kinds.filter(isWordCapKind);

    const rows = named.map((kind) => {
      return `| ${wordCapLabels[kind]} | ${wordCaps[kind]} |`;
    });

    return ["| Text | Word cap |", "| --- | --- |", ...rows].join("\n");
  };
}
