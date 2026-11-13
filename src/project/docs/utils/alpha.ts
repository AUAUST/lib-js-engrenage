import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const alpha = createTagPreset({
  name: "alpha",
  body: "none",
  excludes: ["beta"],
});
