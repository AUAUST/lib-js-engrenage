import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const typedef = createTagPreset({
  name: "typedef",
  type: "required",
  subject: "name",
  body: "none",
});
