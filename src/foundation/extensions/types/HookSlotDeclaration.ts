import type { StandardSchemaV1 } from "@standard-schema/spec";

export interface HookSlotDeclaration {
  readonly kind: "hook";
  readonly entry?: StandardSchemaV1;
}
