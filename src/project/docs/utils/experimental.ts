import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const experimental = createTagPreset({
  name: "experimental",
  body: "none",
  excludes: ["stable"],
});
