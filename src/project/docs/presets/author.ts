import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@author`: one line naming an author, repeatable.
 *
 * @experimental
 */
export const author = createTagPreset({
  name: "author",
  body: "inline",
  multiple: true,
});
