export function collectArgument(
  value: string,
  previous: readonly string[] = [],
): string[] {
  return [...previous, value];
}
