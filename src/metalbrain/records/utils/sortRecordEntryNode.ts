import { isScalar, type YAMLMap } from "yaml";

import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Sorts the pairs of an entry `node` in the order `kind` writes them: its `id`,
 * each field in the kind's order, then any key the kind lacks, as they were.
 */
export function sortRecordEntryNode(kind: RecordKind, node: YAMLMap): void {
  const declared = ["id", ...Object.keys(kind.fields)];

  function rank(key: unknown): number {
    const position = declared.indexOf(String(isScalar(key) ? key.value : key));

    return position === -1 ? declared.length : position;
  }

  node.items.sort((first, second) => rank(first.key) - rank(second.key));
}
