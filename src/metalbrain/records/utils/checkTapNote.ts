import { countWords } from "#foundation/markdown/index";

/**
 * Checks that `note` is one line of text within `cap` words, as a tap note.
 *
 * @throws {Error} When it is not.
 */
export function checkTapNote(note: string, cap: number): void {
  if (note.trim() === "" || /[\n\r]/u.test(note)) {
    throw new Error("A tap note is one line of text");
  }

  const words = countWords(note);

  if (words > cap) {
    throw new Error(`The tap note holds ${words} words, over ${cap}`);
  }
}
