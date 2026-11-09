import type { EntryValidator } from "#foundation/extensions/types/EntryValidator";
import type { EdgeDeclaration } from "#foundation/extensions/types/EdgeDeclaration";

export interface ListSlotDeclaration {
  readonly kind?: "data";
  readonly cardinality?: "many";
  readonly stages?: readonly string[];
  readonly edges?: boolean | EdgeDeclaration;
  readonly entry?: EntryValidator;
}
