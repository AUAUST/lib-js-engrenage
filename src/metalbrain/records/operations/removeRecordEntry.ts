import { formatRecordDocument } from "#metalbrain/records/utils/formatRecordDocument";
import { removeRecordTaps } from "#metalbrain/records/utils/removeRecordTaps";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FoundRecord } from "#metalbrain/records/types/FoundRecord";

/**
 * Stages the removal of the `found` entry and its taps from its group file,
 * removing the file once it holds no entry, and leaving the index as it is.
 *
 * @returns Whether the group file was removed.
 */
export async function removeRecordEntry(
  filesystem: Filesystem,
  found: FoundRecord,
): Promise<boolean> {
  const { file, document, entries, position, id } = found;

  removeRecordTaps(found, id);

  entries.delete(position);

  if (entries.items.length === 0) {
    await filesystem.remove(file);

    return true;
  }

  await filesystem.write(file, formatRecordDocument(document));

  return false;
}
