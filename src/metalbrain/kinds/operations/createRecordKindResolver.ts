import { resolveRecordKind } from "#metalbrain/kinds/operations/resolveRecordKind";
import { findNamedRecordKind } from "#metalbrain/kinds/utils/findNamedRecordKind";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/index";

/**
 * The kind of the entry each given ID names: the kind `name` names for
 * every ID when given, so an ID of another kind fails, otherwise the kind
 * `resolveRecordKind` reads from the ID.
 *
 * @throws {Error} When `name` names no record kind.
 */
export function createRecordKindResolver(
  filesystem: Filesystem,
  name: string | undefined,
): (given: string) => RecordKind | Promise<RecordKind> {
  const named = name === undefined ? undefined : findNamedRecordKind(name);

  return (given) => {
    return named ?? resolveRecordKind(filesystem, given);
  };
}
