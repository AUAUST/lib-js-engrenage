import type { Files } from "#types/Files";

/**
 * The staged changes against `HEAD`: every file they touch, deleted ones included,
 * and the lines they add, in diff order.
 */
export interface StagedChanges {
  readonly files: Files;
  readonly added: readonly string[];
}
