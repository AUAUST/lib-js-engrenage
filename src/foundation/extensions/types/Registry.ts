import type { Contribution } from "#foundation/extensions/types/Contribution";
import type { DeclarationOf } from "#foundation/extensions/types/DeclarationOf";
import type { EntryOf } from "#foundation/extensions/types/EntryOf";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { KindOf } from "#foundation/extensions/types/KindOf";
import type { OwnedDeclaration } from "#foundation/extensions/types/OwnedDeclaration";
import type { PayloadOf } from "#foundation/extensions/types/PayloadOf";
import type { SlotOf } from "#foundation/extensions/types/SlotOf";

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
  contributions<Slot extends SlotOf<Extension>>(
    slot: Slot,
  ): Promise<readonly Contribution<Extension, EntryOf<Extension, Slot>>[]>;
  select<Slot extends SlotOf<Extension>>(
    slot: Slot,
    name: string,
  ): Promise<Contribution<Extension, EntryOf<Extension, Slot>>>;
  emit<Slot extends SlotOf<Extension>>(
    slot: Slot,
    payload: PayloadOf<EntryOf<Extension, Slot>>,
  ): Promise<void>;
  isActive(name: string): Promise<boolean>;
}
