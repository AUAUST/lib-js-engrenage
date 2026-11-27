import type { StackEntry } from "#nexus/reports/types/StackEntry";

/**
 * An entry reporting an error's stack `trace`.
 *
 * @pure
 */
export function stackEntry(trace: string): StackEntry {
  return { kind: "stack", trace };
}
