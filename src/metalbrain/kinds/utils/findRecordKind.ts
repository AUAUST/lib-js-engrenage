import { recordKinds } from "#metalbrain/kinds/constants";
import { parseRecordId } from "#metalbrain/records/index";

/**
 * The record kind whose namespace opens the entry ID `id`.
 *
 * @throws {Error} When `id` has no entry ID's form or no kind declares
 * its namespace.
 */
export function findRecordKind(id: string): (typeof recordKinds)[number] {
  const namespace = parseRecordId(id)?.namespace;

  const kind = recordKinds.find((candidate) => {
    return candidate.namespace === namespace;
  });

  if (kind === undefined) {
    throw new Error(
      `"${id}": expected an entry ID as <namespace>-xxxxxx, 6 hex characters, its namespace one of ${recordKinds
        .map((candidate) => `${candidate.namespace} (${candidate.name})`)
        .join(", ")}`,
    );
  }

  return kind;
}
