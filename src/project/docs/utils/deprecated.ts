import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const deprecated = createTagPreset({
  name: "deprecated",
  body: "text",
});
