export function stripCode(text: string): string {
  return text
    .replaceAll(/^[ \t]*(```|~~~)[\s\S]*?^[ \t]*\1.*$/gm, "")
    .replaceAll(/(`+)[^`]*?\1/g, "");
}
