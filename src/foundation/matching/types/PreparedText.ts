import type { TextWord } from "#foundation/matching/types/TextWord";

export interface PreparedText {
  readonly source: string;
  readonly text: string;
  readonly words: readonly TextWord[];
}
