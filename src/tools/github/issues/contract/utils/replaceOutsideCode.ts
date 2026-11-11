// @debt repeats the fence and code span patterns of `stripCode` instead of sharing one code splitter
const codePattern = /^[ \t]*(```|~~~)[\s\S]*?^[ \t]*\1.*$|(`+)[^`]*?\2/gm;

export function replaceOutsideCode(
  text: string,
  pattern: RegExp,
  replace: (match: string, ...groups: string[]) => string,
): string {
  function replaceText(segment: string) {
    return segment.replaceAll(pattern, (match: string, ...groups: string[]) => {
      return replace(match, ...groups);
    });
  }

  let result = "";
  let last = 0;

  for (const match of text.matchAll(codePattern)) {
    result += replaceText(text.slice(last, match.index));

    result += match[0];

    last = match.index + match[0].length;
  }

  return result + replaceText(text.slice(last));
}
