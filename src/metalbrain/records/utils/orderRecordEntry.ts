import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * `entry`'s defined keys in the order `kind` writes them: its `id`, each field
 * in the kind's order, then any key the kind lacks.
 */
export function orderRecordEntry(
  kind: RecordKind,
  entry: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const declared = ["id", ...Object.keys(kind.fields)];

  return Object.fromEntries([
    ...declared.flatMap((key) => {
      return entry[key] === undefined ? [] : [[key, entry[key]] as const];
    }),
    ...Object.entries(entry).filter(([key]) => !declared.includes(key)),
  ]);
}
