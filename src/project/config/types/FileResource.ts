import type { MaybePromise } from "@auaust/toolkit/types";

import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { FileLocation } from "#project/config/types/FileLocation";

/**
 * A file, directory or glob set an extension owns under `owns.files`, located only
 * while its owner is active; two resources at the same path fail the `resources`
 * key.
 *
 * @stable
 */
export interface FileResource {
  /**
   * Locates the resource in the project, `undefined` when the project has none.
   * A rejection fails only the reads of this resource and the listings its flags
   * match.
   */
  locate(config: ConfigResolver): MaybePromise<FileLocation | undefined>;
  /**
   * Display name; defaults to the owner's title, then its name.
   */
  readonly title?: string;
  /**
   * Whether the resource is committed; `false` adds it to `.gitignore` and the
   * ESLint ignores. Defaults to `true`.
   */
  readonly committed?: boolean;
  /**
   * Whether a tool generates the resource; `true` adds it to `.prettierignore`.
   * Defaults to `false`.
   */
  readonly generated?: boolean;
  /**
   * Whether Prettier formats the resource; defaults to committed and not
   * generated.
   */
  readonly formatted?: boolean;
  /**
   * Whether other extensions may own parts of the resource, as `<resource>#<part>`
   * under `owns.parts`. Defaults to `false`.
   */
  readonly parts?: boolean;
}
