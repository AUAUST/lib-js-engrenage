import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const author = createTagPreset({
  name: "author",
  body: "inline",
  multiple: true,
});
