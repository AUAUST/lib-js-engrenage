import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";

export type SlotOf<Extension extends ExtensionShape> = keyof NonNullable<
  Extension["contributes"]
> &
  string;
