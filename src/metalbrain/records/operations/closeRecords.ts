import { closeRecord } from "#metalbrain/records/operations/closeRecord";
import { findRecords } from "#metalbrain/records/operations/findRecords";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LocatedRecord } from "#metalbrain/records/types/LocatedRecord";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Stages the removal of every entry `givens` name, each closed as `closeRecord`
 * closes it, once `findRecords` has found all of them in the kind `kindOf`
 * gives for each ID.
 *
 * @returns The closed entries, in argument order.
 * @throws {Error} When `findRecords` fails on any ID, staging nothing.
 */
export async function closeRecords(
  filesystem: Filesystem,
  givens: readonly string[],
  kindOf: (given: string) => RecordKind | Promise<RecordKind>,
): Promise<readonly LocatedRecord[]> {
  const located = await findRecords(
    filesystem,
    givens,
    kindOf,
    "No entry was closed:",
  );

  for (const { kind, found } of located) {
    await closeRecord(filesystem, kind, found.id);
  }

  return located;
}
