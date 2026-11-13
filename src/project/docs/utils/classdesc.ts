import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@classdesc`: a text body describing a class.
 *
 * @experimental
 */
export const classdesc = createTagPreset({
  name: "classdesc",
  body: "text",
});
