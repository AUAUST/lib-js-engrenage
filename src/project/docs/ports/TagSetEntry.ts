import type { EntryShape } from "#foundation/extensions/index";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

export interface TagSetEntry extends EntryShape {
  readonly name: string;
  load(): Promise<readonly TagDeclaration[]>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "docs.tags": TagSetEntry;
    }
  }
}
