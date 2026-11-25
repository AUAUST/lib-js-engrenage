import { isMap, isScalar, isSeq, YAMLSeq } from "yaml";

import type { RecordDocument } from "#metalbrain/records/types/RecordDocument";
import type { RecordTap } from "#metalbrain/records/types/RecordTap";

/**
 * Appends `taps` to the `taps` list of `record`, each on one line, creating the
 * list before `entries` when missing, so taps and appended entries never share
 * the lines a union merge combines.
 */
export function appendRecordTaps(
  { document }: RecordDocument,
  taps: readonly RecordTap[],
): void {
  if (taps.length === 0) {
    return;
  }

  const existing = document.get("taps");

  const list = isSeq(existing) ? existing : new YAMLSeq(document.schema);

  if (list !== existing) {
    const root = document.contents;

    if (!isMap(root)) {
      throw new TypeError("A record group document holds a map");
    }

    const position = root.items.findIndex(({ key }) => {
      return isScalar(key) && key.value === "entries";
    });

    root.items.splice(
      position === -1 ? root.items.length : position,
      0,
      document.createPair("taps", list),
    );
  }

  for (const tap of taps) {
    const node = document.createNode({ ...tap });

    node.flow = true;

    list.add(node);
  }
}
