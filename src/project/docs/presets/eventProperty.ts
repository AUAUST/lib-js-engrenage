import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@eventProperty`, marking a property that returns an event: no body.
 *
 * @experimental
 */
export const eventProperty = createTagPreset({
  name: "eventProperty",
  body: "none",
});
