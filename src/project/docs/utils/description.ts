import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@description`: a text body describing the declaration.
 *
 * @experimental
 */
export const description = createTagPreset({
  name: "description",
  body: "text",
});
