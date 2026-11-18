import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@readonly`, marking a member never reassigned: no body.
 *
 * @experimental
 */
export const readonly = createTagPreset({
  name: "readonly",
  body: "none",
});
