import type { EntryShape } from "#foundation/extensions/index";
import type { Convention } from "#tools/eslint/types/Convention";

export interface ConventionEntry extends EntryShape {
  readonly name: string;
  readonly category: string;
  load(): Promise<Convention>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "eslint.conventions": ConventionEntry;
    }

    interface ConventionCategories {}
  }
}
