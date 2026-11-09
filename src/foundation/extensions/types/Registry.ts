import type { DeclarationOf } from "#foundation/extensions/types/DeclarationOf";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { KindOf } from "#foundation/extensions/types/KindOf";
import type { OwnedDeclaration } from "#foundation/extensions/types/OwnedDeclaration";

export interface Registry<Extension extends ExtensionShape> {
  readonly extensions: readonly Extension[];
  owner(kind: KindOf<Extension>, key: string): Extension | undefined;
  get<Kind extends KindOf<Extension>>(
    kind: Kind,
    key: string,
  ): DeclarationOf<Extension, Kind> | undefined;
  list<Kind extends KindOf<Extension>>(
    kind: Kind,
  ): readonly OwnedDeclaration<Extension, DeclarationOf<Extension, Kind>>[];
}
