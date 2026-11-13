import type { EntryShape } from "#foundation/extensions/index";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

export interface TagSetEntry extends EntryShape {
  /**
   * Names the set, with its extension's name, in the error raised when two sets
   * declare the same tag.
   */
  readonly name: string;
  /**
   * Loads the declarations, each tag name declared by no other set; their order
   * is the set's canonical tag order.
   */
  load(): Promise<readonly TagDeclaration[]>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "docs.tags": TagSetEntry;
    }
  }
}
