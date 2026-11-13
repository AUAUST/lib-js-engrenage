import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const property = createTagPreset({
  name: "property",
  type: "optional",
  subject: "name",
  body: "text",
  multiple: true,
});
