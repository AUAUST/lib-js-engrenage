import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@private`: no body, never alongside `@public` or `@protected`.
 *
 * @experimental
 */
export const privateTag = createTagPreset({
  name: "private",
  body: "none",
  excludes: ["public", "protected"],
});
