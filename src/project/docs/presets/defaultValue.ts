import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@defaultValue`: a text body stating the default value.
 *
 * @experimental
 */
export const defaultValue = createTagPreset({
  name: "defaultValue",
  body: "text",
});
