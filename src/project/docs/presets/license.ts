import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@license`: one line naming the license.
 *
 * @experimental
 */
export const license = createTagPreset({
  name: "license",
  body: "inline",
});
