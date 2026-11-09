import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { EdgeDeclaration } from "#foundation/extensions/types/EdgeDeclaration";

export interface ListSlotDeclaration {
  readonly kind?: "data";
  readonly cardinality?: "many";
  readonly stages?: readonly string[];
  readonly edges?: boolean | EdgeDeclaration;
  readonly entry?: StandardSchemaV1;
}
