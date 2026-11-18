import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@public`: no body, never alongside `@private` or `@protected`.
 *
 * @experimental
 */
export const publicTag = createTagPreset({
  name: "public",
  body: "none",
  excludes: ["private", "protected"],
});
