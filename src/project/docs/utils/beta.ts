import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const beta = createTagPreset({
  name: "beta",
  body: "none",
  excludes: ["alpha"],
});
