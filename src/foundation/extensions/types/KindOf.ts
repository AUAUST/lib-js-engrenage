import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";

export type KindOf<Extension extends ExtensionShape> = keyof NonNullable<
  Extension["owns"]
> &
  string;
