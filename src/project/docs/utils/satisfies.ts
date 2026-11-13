import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@satisfies`: a required `{type}`, no body.
 *
 * @experimental
 */
export const satisfies = createTagPreset({
  name: "satisfies",
  type: "required",
  body: "none",
});
