export function findCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
