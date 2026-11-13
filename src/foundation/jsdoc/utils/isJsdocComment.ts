const openingPattern = /^\/\*\*(?!\/)/;

export function isJsdocComment(comment: string): boolean {
  return openingPattern.test(comment);
}
