const blankPattern = /^\s*$/;

export function findCommentLines(
  text: string,
  [start, end]: readonly [start: number, end: number],
): readonly [start: number, end: number] | undefined {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const newline = text.indexOf("\n", end);
  const lineEnd = newline === -1 ? text.length : newline;

  const alone = (
    blankPattern.test(text.slice(lineStart, start)) &&
    blankPattern.test(text.slice(end, lineEnd))
  );

  return alone ? [lineStart, lineEnd] : undefined;
}
