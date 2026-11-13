import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@throws`: an optional `{type}` and a text body, repeatable.
 *
 * @experimental
 */
export const throws = createTagPreset({
  name: "throws",
  type: "optional",
  body: "text",
  multiple: true,
});
