import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const privateTag = createTagPreset({
  name: "private",
  body: "none",
  excludes: ["public", "protected"],
});
