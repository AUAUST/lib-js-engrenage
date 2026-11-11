export function isClaimedStem(stem: string): boolean {
  return /^\d+$/.test(stem);
}
