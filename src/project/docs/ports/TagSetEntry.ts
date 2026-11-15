import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

/**
 * Tag declarations, each tag name declared by no other set; their order is the
 * set's canonical tag order.
 */
export interface TagSetEntry
  extends EntryShape, Lazy<readonly TagDeclaration[]> {
  /**
   * Names the set, with its extension's name, in the error raised when two sets
   * declare the same tag.
   */
  readonly name: string;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "docs.tags": TagSetEntry;
    }
  }
}
