import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares the tag documenting an exception: an optional `{type}` and a
 * text body, repeatable.
 *
 * @experimental
 */
export const throws = createTagPreset({
  name: "throws",
  type: "optional",
  body: "text",
  multiple: true,
});
