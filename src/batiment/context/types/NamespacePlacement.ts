import type { OptionSource } from "#batiment/report/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface NamespacePlacement {
  readonly name: string;
  /**
   * Describes the files of the top-level namespace the placement covers as an
   * import category in the project map.
   */
  readonly title: string;
  /**
   * The namespace kind the config names for that namespace, with the option
   * it comes from.
   */
  readonly kind: { readonly value: string; readonly config: OptionSource };
  readonly dirs: Directories;
  readonly files: Globs;
}
