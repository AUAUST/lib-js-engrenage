import type { StandardSchemaV1 } from "@standard-schema/spec";

export interface BucketSlotDeclaration {
  readonly kind?: "data";
  readonly cardinality: "one";
  readonly entry?: StandardSchemaV1;
}
