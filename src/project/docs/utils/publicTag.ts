import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const publicTag = createTagPreset({
  name: "public",
  body: "none",
  excludes: ["private", "protected"],
});
