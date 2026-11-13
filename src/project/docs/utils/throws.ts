import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const throws = createTagPreset({
  name: "throws",
  type: "optional",
  body: "text",
  multiple: true,
});
