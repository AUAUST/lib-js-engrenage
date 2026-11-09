import type { EntryValidator } from "#foundation/extensions/types/EntryValidator";

export interface BucketSlotDeclaration {
  readonly kind?: "data";
  readonly cardinality: "one";
  readonly entry?: EntryValidator;
}
