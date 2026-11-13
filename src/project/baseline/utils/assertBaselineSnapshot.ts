const snapshotPattern = /^\d{4}-(?:0[1-9]|1[0-2])$/;

/**
 * Throws unless `snapshot` is a `YYYY-MM` month.
 */
export function assertBaselineSnapshot(snapshot: string): void {
  if (!snapshotPattern.test(snapshot)) {
    throw new Error(`The baseline snapshot ${snapshot} is not a YYYY-MM date`);
  }
}
