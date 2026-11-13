import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const protectedTag = createTagPreset({
  name: "protected",
  body: "none",
  excludes: ["public", "private"],
});
