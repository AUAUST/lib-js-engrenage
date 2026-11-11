import type { EntryShape } from "#foundation/extensions/index";
import type { Options } from "#tools/prettier/types/Options";
import type { Plugin } from "#tools/prettier/types/Plugin";
import type { Globs } from "#types/Globs";

export interface PrettierPlugin extends EntryShape {
  readonly name: string;
  readonly files?: Globs;
  readonly options?: Options;
  load(): Promise<Plugin>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "prettier.plugins": PrettierPlugin;
    }
  }
}
