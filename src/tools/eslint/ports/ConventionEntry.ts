import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { Convention } from "#tools/eslint/ports/Convention";

/**
 * A convention, loaded when the ESLint config is built.
 *
 * @experimental
 */
export interface ConventionEntry extends EntryShape, Lazy<Convention> {
  /**
   * Convention name within its category, the key that enables or disables it in
   * the category's option; unique within the category.
   */
  readonly name: string;
  /**
   * Option key grouping the extension's conventions. A built-in category, or one
   * another extension contributes to, fails.
   */
  readonly category: string;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "eslint.conventions": ConventionEntry;
    }

    interface ConventionCategories {}
  }
}
