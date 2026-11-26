/**
 * The notice naming the instances `engrenage typecheck` skips, as
 * `resolveTscArguments` describes them; none when it skips none.
 */
export function describeUncheckedInstances(
  skipped: readonly string[],
): string | undefined {
  return skipped.length === 0
    ? undefined
    : `Not type-checked: ${skipped.join(", ")}`;
}
