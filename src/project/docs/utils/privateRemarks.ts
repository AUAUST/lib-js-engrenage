import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const privateRemarks = createTagPreset({
  name: "privateRemarks",
  body: "text",
  output: "internal",
});
