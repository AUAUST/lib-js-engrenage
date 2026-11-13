import type { EntryShape } from "#foundation/extensions/index";
import type { Convention } from "#tools/eslint/ports/Convention";

/**
 * @experimental
 */
export interface ConventionEntry extends EntryShape {
  /**
   * Convention name within its category, the key that enables or disables it in
   * the category's option; unique within the category.
   */
  readonly name: string;
  /**
   * Option key grouping the extension's conventions. A built-in category, or one
   * another extension contributes to, throws.
   */
  readonly category: string;
  /**
   * Loads the convention when the ESLint config is built.
   */
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
