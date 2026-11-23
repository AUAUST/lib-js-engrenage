import type {
  ExtensionShape,
  SlotDeclaration,
} from "#foundation/extensions/index";
import type { DirectiveDeclaration } from "#project/config/types/DirectiveDeclaration";
import type { FileResource } from "#project/config/types/FileResource";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";
import type { PackageName } from "#types/PackageName";

/**
 * An engrenage extension: the config keys, slots, file resources, file parts,
 * block directives and line markers it owns, and the entries it contributes to
 * slots. With `when.installed`, it is active only while the project depends on
 * that package; with `when.config`, a dotted config key path, only while that
 * key resolves to `true`.
 *
 * @stable
 */
export interface Extension extends ExtensionShape<
  {
    readonly keys?: Readonly<Record<string, KeyDeclaration>>;
    readonly slots?: Readonly<Record<string, SlotDeclaration>>;
    readonly files?: Readonly<Record<string, FileResource>>;
    readonly parts?: Readonly<Record<`${string}#${string}`, true>>;
    readonly directives?: Readonly<Record<string, DirectiveDeclaration>>;
    readonly markers?: Readonly<Record<string, true>>;
  },
  {
    readonly [Slot in keyof Engrenage.Slots]?: readonly Engrenage.Slots[Slot][];
  },
  { readonly installed: PackageName } | { readonly config: string }
> {
  /**
   * URL of the extension package's root directory, with a trailing slash: its
   * `./metalbrain/<kind>/*.md` package exports hold the bodies of the sections,
   * rules and skills it registers in `agents.instructions`.
   */
  readonly root?: URL;
  /**
   * The semver range of engrenage versions the extension supports, prereleases
   * included; loading the config fails when the installed version is outside it
   * or the range is invalid.
   */
  readonly compatibility?: { readonly engrenage: string };
}
