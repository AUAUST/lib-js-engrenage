import type {
  ExtensionShape,
  SlotDeclaration,
} from "#foundation/extensions/index";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";
import type { PackageName } from "#types/PackageName";

export interface Extension extends ExtensionShape<
  {
    readonly keys?: Readonly<Record<string, KeyDeclaration>>;
    readonly slots?: Readonly<Record<string, SlotDeclaration>>;
  },
  {
    readonly [Slot in keyof EngrenageSlots]?: readonly EngrenageSlots[Slot][];
  },
  { readonly installed: PackageName }
> {}
