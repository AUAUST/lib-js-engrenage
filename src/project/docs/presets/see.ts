import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@see`: one line of reference, repeatable.
 *
 * @experimental
 */
export const see = createTagPreset({
  name: "see",
  body: "inline",
  multiple: true,
});
