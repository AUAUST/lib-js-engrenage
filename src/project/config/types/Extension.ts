import type {
  ExtensionShape,
  SlotDeclaration,
} from "#foundation/extensions/index";
import type { FileResource } from "#project/config/types/FileResource";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";
import type { PackageName } from "#types/PackageName";

/**
 * An engrenage extension: the config keys, slots, file resources and file parts
 * it owns, and the entries it contributes to slots. With `when.installed`, it is
 * active only while the project depends on that package.
 *
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
  /**
   * URL of the extension package's root directory, with a trailing slash: its
   * `./agents/<kind>/*.md` package exports join the agent instruction templates.
   */
  readonly root?: URL;
  /**
   * The semver range of engrenage versions the extension supports, prereleases
   * included; loading the config throws when the installed version is outside it
   * or the range is invalid.
   */
  readonly compatibility?: { readonly engrenage: string };
}
