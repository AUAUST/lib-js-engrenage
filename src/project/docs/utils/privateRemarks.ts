import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@privateRemarks`: a text body trimmed from built declarations.
 *
 * @experimental
 */
export const privateRemarks = createTagPreset({
  name: "privateRemarks",
  body: "text",
  output: "internal",
});
