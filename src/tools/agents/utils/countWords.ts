import { stripCode } from "#foundation/markdown/index";

const linkTargetPattern = /\]\([^)]*\)/g;

export function countWords(text: string): number {
  const prose = stripCode(text).replaceAll(linkTargetPattern, "]").trim();

  return prose === "" ? 0 : prose.split(/\s+/).length;
}
