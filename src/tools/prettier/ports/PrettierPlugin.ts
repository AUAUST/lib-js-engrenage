import type { EntryShape } from "#foundation/extensions/index";
import type { Options } from "#tools/prettier/types/Options";
import type { Plugin } from "#tools/prettier/types/Plugin";
import type { Globs } from "#types/Globs";

export interface PrettierPlugin extends EntryShape {
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
  /**
   * Loads the plugin when the Prettier config is built.
   */
  load(): Promise<Plugin>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "prettier.plugins": PrettierPlugin;
    }
  }
}
