import type { WordCapKind } from "#metalbrain/records/types/WordCapKind";

/**
 * A `## ` section of an agent-written text whose word count exceeds the word cap
 * of its kind; `subject` is the section heading.
 */
export interface WordCapFinding {
  readonly subject: string;
  readonly kind: WordCapKind;
  readonly words: number;
  readonly cap: number;
}
