import { randomInt } from "node:crypto";

import type { RecordKind } from "#metalbrain/records/types/RecordKind";

const suffixes = 0x1_00_00_00;

/**
 * A new entry ID of `kind`, missing from `taken`: the kind's namespace, a dash,
 * then 6 hex characters starting from a random value.
 *
 * @throws {Error} When `taken` holds every ID of the namespace.
 */
export function createRecordId(
  { namespace }: Pick<RecordKind, "namespace">,
  taken: ReadonlySet<string>,
): string {
  const start = randomInt(suffixes);

  for (let offset = 0; offset < suffixes; offset++) {
    const suffix = ((start + offset) % suffixes).toString(16).padStart(6, "0");

    const id = `${namespace}-${suffix}`;

    if (!taken.has(id)) {
      return id;
    }
  }

  throw new Error(`Every record entry ID of ${namespace} is taken`);
}
