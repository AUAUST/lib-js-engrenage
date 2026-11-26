import type { Files } from "#types/Files";

/**
 * The changes a gate run verifies, as `GateRun` takes them.
 */
export interface GateChanges {
  readonly files: Files;
  readonly removed: Files;
}
