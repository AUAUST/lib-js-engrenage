import { randomInt } from "node:crypto";

const suffixes = 0x1_00_00;

/**
 * A new record entry ID for `day`, missing from `taken`: the day as `YYMMDD`,
 * then 4 hex characters starting from a random value.
 *
 * @throws {Error} When `taken` holds every ID of `day`.
 */
export function createRecordId(taken: ReadonlySet<string>, day: Date): string {
  const prefix = day.toISOString().slice(2, 10).replaceAll("-", "");

  const start = randomInt(suffixes);

  for (let offset = 0; offset < suffixes; offset++) {
    const suffix = ((start + offset) % suffixes).toString(16).padStart(4, "0");

    const id = `${prefix}-${suffix}`;

    if (!taken.has(id)) {
      return id;
    }
  }

  throw new Error(`Every record entry ID of ${prefix} is taken`);
}
