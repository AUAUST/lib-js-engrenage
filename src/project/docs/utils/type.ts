import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const type = createTagPreset({
  name: "type",
  type: "required",
  body: "none",
});
