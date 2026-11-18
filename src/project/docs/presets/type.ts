import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@type`: a required `{type}`, no body.
 *
 * @experimental
 */
export const type = createTagPreset({
  name: "type",
  type: "required",
  body: "none",
});
