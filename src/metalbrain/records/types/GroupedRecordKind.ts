import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { Directory } from "#types/Directory";

/**
 * A record kind keeping a directory of group files with a generated index.
 */
export interface GroupedRecordKind<
  WordCap extends string = string,
> extends RecordKind<WordCap> {
  readonly location: { readonly directory: Directory };
}
