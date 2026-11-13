import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const stable = createTagPreset({
  name: "stable",
  body: "none",
  excludes: ["experimental"],
});
