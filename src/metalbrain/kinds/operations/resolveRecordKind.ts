import { findRecordKind } from "#metalbrain/kinds/utils/findRecordKind";
import { resolveRecordId } from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * The kind whose namespace opens the current ID of the entry `given` names, a
 * former ID resolved as `resolveRecordId` resolves it.
 *
 * @throws {Error} When `resolveRecordId` cannot resolve `given`, or no kind
 * declares the resolved ID's namespace.
 */
export async function resolveRecordKind(
  filesystem: Filesystem,
  given: string,
): Promise<ReturnType<typeof findRecordKind>> {
  return findRecordKind(await resolveRecordId(filesystem, given));
}
