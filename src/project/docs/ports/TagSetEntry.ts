import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { TagSet } from "#project/docs/types/TagSet";

/**
 * Tag declarations, each tag name declared by no other set; their order is the
 * set's canonical tag order.
 */
export interface TagSetEntry extends EntryShape, Lazy<TagSet> {
  /**
   * Names the set, with its extension's name, in the conflict reported when two
   * sets declare the same tag.
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
