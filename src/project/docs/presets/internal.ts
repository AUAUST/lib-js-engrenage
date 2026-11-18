import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@internal`, marking an export outside the public contract: no body.
 *
 * @experimental
 */
export const internal = createTagPreset({
  name: "internal",
  body: "none",
});
