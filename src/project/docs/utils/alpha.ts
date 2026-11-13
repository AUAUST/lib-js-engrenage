import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@alpha`, marking an alpha-stage export: no body, never alongside
 * `@beta`.
 *
 * @experimental
 */
export const alpha = createTagPreset({
  name: "alpha",
  body: "none",
  excludes: ["beta"],
});
