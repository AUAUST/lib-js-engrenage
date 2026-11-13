import type { Contribution } from "#foundation/extensions/types/Contribution";
import type { DeclarationOf } from "#foundation/extensions/types/DeclarationOf";
import type { EntryOf } from "#foundation/extensions/types/EntryOf";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { KindOf } from "#foundation/extensions/types/KindOf";
import type { OwnedDeclaration } from "#foundation/extensions/types/OwnedDeclaration";
import type { PayloadOf } from "#foundation/extensions/types/PayloadOf";
import type { SlotOf } from "#foundation/extensions/types/SlotOf";

export interface Registry<Extension extends ExtensionShape, Scope = unknown> {
  /**
   * Every collected extension in registration order, active or not.
   */
  readonly extensions: readonly Extension[];
  /**
   * The extension owning `key` in `kind`, or `undefined` when no extension
   * declares it. Ignores activation.
   */
  owner(kind: KindOf<Extension>, key: string): Extension | undefined;
  /**
   * The declaration of `key` in `kind`, or `undefined` when no extension declares
   * it. Ignores activation.
   */
  get<Kind extends KindOf<Extension>>(
    kind: Kind,
    key: string,
  ): DeclarationOf<Extension, Kind> | undefined;
  /**
   * Every declaration of `kind` with its key and owner, in registration order,
   * active or not. Returns an empty list for a kind no extension declares.
   */
  list<Kind extends KindOf<Extension>>(
    kind: Kind,
  ): readonly OwnedDeclaration<Extension, DeclarationOf<Extension, Kind>>[];
  /**
   * The contributions to `slot` whose extensions are active in `scope`, in the
   * slot's order: a list slot orders them by stage, then by edges; other slots
   * keep registration order. Each extension's activation is evaluated on its
   * own: an active extension never activates the extensions it requires.
   *
   * @throws When `slot` is unknown or an active extension requires an inactive
   * one.
   */
  contributions<Slot extends SlotOf<Extension>>(
    slot: Slot,
    scope: Scope,
  ): Promise<readonly Contribution<Extension, EntryOf<Extension, Slot>>[]>;
  /**
   * The entry named `name` in the bucket `slot`, contributed by an extension
   * active in `scope`.
   *
   * @throws When `slot` is unknown or not a bucket, no entry has that name,
   * its extension is inactive, or an active contributor requires an inactive
   * extension.
   */
  select<Slot extends SlotOf<Extension>>(
    slot: Slot,
    name: string,
    scope: Scope,
  ): Promise<Contribution<Extension, EntryOf<Extension, Slot>>>;
  /**
   * Loads and awaits each subscriber of the hook `slot` active in `scope`, one
   * after the other in registration order, passing them `payload`.
   *
   * @throws When `slot` is unknown or not a hook, an active contributor requires
   * an inactive extension, or a subscriber throws, which skips the subscribers
   * after it.
   */
  emit<Slot extends SlotOf<Extension>>(
    slot: Slot,
    payload: PayloadOf<EntryOf<Extension, Slot>>,
    scope: Scope,
  ): Promise<void>;
  /**
   * Whether the extension named `name` is active in `scope`.
   *
   * @throws When no extension has that name, or the extension is active but
   * requires an inactive one.
   */
  isActive(name: string, scope: Scope): Promise<boolean>;
}
