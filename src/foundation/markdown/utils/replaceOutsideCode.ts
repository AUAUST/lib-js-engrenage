import { listCodeRanges } from "#foundation/markdown/utils/listCodeRanges";

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

  for (const { start, end } of listCodeRanges(text)) {
    result += replaceText(text.slice(last, start)) + text.slice(start, end);

    last = end;
  }

  return result + replaceText(text.slice(last));
}
