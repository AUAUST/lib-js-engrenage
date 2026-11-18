import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@remarks`: a text body for details past the summary.
 *
 * @experimental
 */
export const remarks = createTagPreset({
  name: "remarks",
  body: "text",
});
