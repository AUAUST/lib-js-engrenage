export function toDraftReference(stem: string): string {
  return /^\d+$/.test(stem) ? `#${stem}` : `#{${stem}}`;
}
