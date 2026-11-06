const fencePattern = /^[ \t]*(```|~~~)[\s\S]*?^[ \t]*\1.*$/gm;

const codeSpanPattern = /(`+)[\s\S]*?\1/g;

const linkTargetPattern = /\]\([^)]*\)/g;

export function countWords(text: string): number {
  const prose = text
    .replaceAll(fencePattern, " ")
    .replaceAll(codeSpanPattern, " ")
    .replaceAll(linkTargetPattern, "]")
    .trim();

  return prose === "" ? 0 : prose.split(/\s+/).length;
}
