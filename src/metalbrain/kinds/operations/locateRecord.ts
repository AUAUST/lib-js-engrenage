import { findRecordKind } from "#metalbrain/kinds/utils/findRecordKind";
import { findRecord, resolveRecordId } from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * The entry `given` names, whatever its kind, a former ID resolved as
 * `resolveRecordId` resolves it: the kind its ID's namespace names, and the
 * entry as `findRecord` finds it.
 *
 * @throws {Error} When no kind declares the resolved ID's namespace, or
 * `findRecord` finds no such entry.
 */
export async function locateRecord(filesystem: Filesystem, given: string) {
  const kind = findRecordKind(await resolveRecordId(filesystem, given));

  return {
    kind,
    found: await findRecord(filesystem, kind, given),
  };
}
