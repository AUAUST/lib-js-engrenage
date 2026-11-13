import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@virtual`, marking a member meant to be overridden: no body.
 *
 * @experimental
 */
export const virtual = createTagPreset({
  name: "virtual",
  body: "none",
});
