/**
 * The least pure of `ranked` on the `levels` scale.
 */
export function highestLevel(
  levels: readonly string[],
  ranked: Iterable<string>,
): string | undefined {
  let highest: string | undefined;

  for (const level of ranked) {
    if (
      highest === undefined ||
      levels.indexOf(level) > levels.indexOf(highest)
    ) {
      highest = level;
    }
  }

  return highest;
}
