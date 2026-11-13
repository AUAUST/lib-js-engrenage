import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@callback`: the name of the callback type it declares, no body.
 *
 * @experimental
 */
export const callback = createTagPreset({
  name: "callback",
  subject: "name",
  body: "none",
});
