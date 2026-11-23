import type { RecordField } from "#metalbrain/records/types/RecordField";

/**
 * A record kind's entry schema: each field's name and declaration, in the order
 * entries write them after their `id`.
 */
export type RecordFields = Readonly<Record<string, RecordField>>;
