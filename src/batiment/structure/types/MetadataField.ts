import type { File } from "#types/File";

export interface MetadataField<Value> {
  readonly value: Value;
  readonly file: File;
}
