import type { RecordFieldType } from "#metalbrain/records/types/RecordFieldType";

/**
 * One field of a record kind's entry schema: what it holds, and the help its
 * command option states.
 */
export interface RecordField {
  readonly type: RecordFieldType;
  readonly description: string;
}
