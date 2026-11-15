import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { Options } from "#tools/prettier/types/Options";
import type { Plugin } from "#tools/prettier/types/Plugin";
import type { Globs } from "#types/Globs";

/**
 * A Prettier plugin, loaded when the Prettier config is built.
 */
export interface PrettierPlugin extends EntryShape, Lazy<Plugin> {
  /**
   * Plugin name, unique across the slot.
   */
  readonly name: string;
  /**
   * Globs of an override applying `options` to matching files.
   */
  readonly files?: Globs;
  // @debt `options` is dropped without `files`, with no error telling the contributor
  /**
   * Prettier options for the files `files` matches.
   */
  readonly options?: Options;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "prettier.plugins": PrettierPlugin;
    }
  }
}
