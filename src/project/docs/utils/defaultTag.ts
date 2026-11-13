import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@default`: a text body stating the default value.
 *
 * @experimental
 */
export const defaultTag = createTagPreset({
  name: "default",
  body: "text",
});
