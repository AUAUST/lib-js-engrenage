import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@desc`: a text body describing the declaration.
 *
 * @experimental
 */
export const desc = createTagPreset({
  name: "desc",
  body: "text",
});
