import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@deprecated`: a text body, such as the replacement to use.
 *
 * @experimental
 */
export const deprecated = createTagPreset({
  name: "deprecated",
  body: "text",
});
