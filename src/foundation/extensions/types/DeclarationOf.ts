import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { KindOf } from "#foundation/extensions/types/KindOf";

export type DeclarationOf<
  Extension extends ExtensionShape,
  Kind extends KindOf<Extension>,
> = NonNullable<NonNullable<Extension["owns"]>[Kind]>[keyof NonNullable<
  NonNullable<Extension["owns"]>[Kind]
>];
