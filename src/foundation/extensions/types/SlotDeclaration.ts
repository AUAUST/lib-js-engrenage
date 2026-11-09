import type { BucketSlotDeclaration } from "#foundation/extensions/types/BucketSlotDeclaration";
import type { HookSlotDeclaration } from "#foundation/extensions/types/HookSlotDeclaration";
import type { ListSlotDeclaration } from "#foundation/extensions/types/ListSlotDeclaration";

export type SlotDeclaration =
  ListSlotDeclaration | BucketSlotDeclaration | HookSlotDeclaration;
