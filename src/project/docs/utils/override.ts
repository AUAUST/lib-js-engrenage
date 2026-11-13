import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@override`, marking a member that overrides its base: no body.
 *
 * @experimental
 */
export const override = createTagPreset({
  name: "override",
  body: "none",
});
