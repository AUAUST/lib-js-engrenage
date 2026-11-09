import type { EntryValidator } from "#foundation/extensions/types/EntryValidator";

export interface HookSlotDeclaration {
  readonly kind: "hook";
  readonly entry?: EntryValidator;
}
