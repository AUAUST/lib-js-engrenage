import type { EntryShape } from "#foundation/extensions/types/EntryShape";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { SlotOf } from "#foundation/extensions/types/SlotOf";

export type EntryOf<
  Extension extends ExtensionShape,
  Slot extends SlotOf<Extension>,
> = NonNullable<
  NonNullable<Extension["contributes"]>[Slot]
> extends readonly (infer Entry extends EntryShape)[]
  ? Entry
  : never;
