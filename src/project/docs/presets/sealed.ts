import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@sealed`, marking a class never to extend: no body.
 *
 * @experimental
 */
export const sealed = createTagPreset({
  name: "sealed",
  body: "none",
});
