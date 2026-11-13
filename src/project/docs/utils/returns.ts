import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@returns`: a text body describing the result.
 *
 * @experimental
 */
export const returns = createTagPreset({
  name: "returns",
  body: "text",
});
