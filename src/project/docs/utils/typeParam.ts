import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const typeParam = createTagPreset({
  name: "typeParam",
  subject: "typeParameter",
  body: "text",
  multiple: true,
});
