import type { EntryShape } from "#foundation/extensions/index";
import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob } from "#types/Glob";

/**
 * How the files it matches write block markers; the `blocks` target reads a file
 * with the first syntax matching its path.
 *
 * @experimental
 */
export interface BlockSyntaxEntry extends EntryShape, BlockSyntax {
  /**
   * Names the syntax, unique within the slot.
   */
  readonly name: string;
  /**
   * The globs matched against a file's path, relative to the project root.
   */
  readonly files: readonly Glob[];
}

declare global {
  namespace Engrenage {
    interface Slots {
      "blocks.syntaxes": BlockSyntaxEntry;
    }
  }
}
