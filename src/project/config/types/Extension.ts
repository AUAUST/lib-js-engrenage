import type {
  ExtensionShape,
  SlotDeclaration,
} from "#foundation/extensions/index";
import type { FileResource } from "#project/config/types/FileResource";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";
import type { PackageName } from "#types/PackageName";

/**
 * @stable
 */
export interface Extension extends ExtensionShape<
  {
    readonly keys?: Readonly<Record<string, KeyDeclaration>>;
    readonly slots?: Readonly<Record<string, SlotDeclaration>>;
    readonly files?: Readonly<Record<string, FileResource>>;
    readonly parts?: Readonly<Record<`${string}#${string}`, true>>;
  },
  {
    readonly [Slot in keyof Engrenage.Slots]?: readonly Engrenage.Slots[Slot][];
  },
  { readonly installed: PackageName }
> {
  readonly root?: URL;
  readonly compatibility?: { readonly engrenage: string };
}
