import type { Loadable } from "#foundation/modules/index";
import type { DirectiveFill } from "#project/config/types/DirectiveFill";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { File } from "#types/File";

/**
 * A block directive an extension owns under `owns.directives`: `@<name>` markers
 * in the files it lists are filled by its loaded fill.
 *
 * @experimental
 */
export interface DirectiveDeclaration {
  /**
   * The files the directive may appear in, relative to the project root.
   */
  files(config: LoadedConfig): Promise<readonly File[]>;
  /**
   * Loads the fill, resolved by `loadLazy`.
   */
  load(): Promise<Loadable<DirectiveFill>>;
}
