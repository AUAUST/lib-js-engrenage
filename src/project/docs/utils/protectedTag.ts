import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@protected`: no body, never alongside `@public` or `@private`.
 *
 * @experimental
 */
export const protectedTag = createTagPreset({
  name: "protected",
  body: "none",
  excludes: ["public", "private"],
});
