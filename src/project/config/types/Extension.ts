import type {
  ExtensionShape,
  SlotDeclaration,
} from "#foundation/extensions/index";
import type { FileResource } from "#project/config/types/FileResource";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";
import type { PackageName } from "#types/PackageName";

export interface Extension extends ExtensionShape<
  {
    readonly keys?: Readonly<Record<string, KeyDeclaration>>;
    readonly slots?: Readonly<Record<string, SlotDeclaration>>;
    readonly files?: Readonly<Record<string, FileResource>>;
    readonly parts?: Readonly<Record<`${string}#${string}`, true>>;
  },
  {
    readonly [Slot in keyof EngrenageSlots]?: readonly EngrenageSlots[Slot][];
  },
  { readonly installed: PackageName }
> {}
