import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@module`: one line naming the module.
 *
 * @experimental
 */
export const module = createTagPreset({
  name: "module",
  body: "inline",
});
