import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@overload`, marking an overload signature: no body.
 *
 * @experimental
 */
export const overload = createTagPreset({
  name: "overload",
  body: "none",
});
