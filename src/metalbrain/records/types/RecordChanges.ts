import type { RecordFields } from "#metalbrain/records/types/RecordFields";
import type { RecordValues } from "#metalbrain/records/types/RecordValues";

/**
 * The field values replacing those of an entry of a kind declaring `Fields`: any
 * field as `RecordValues` gives it, absent or `undefined` to keep it.
 */
export type RecordChanges<Fields extends RecordFields> = {
  readonly [Key in keyof RecordValues<Fields>]?:
    RecordValues<Fields>[Key] | undefined;
};
