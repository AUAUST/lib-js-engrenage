import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@beta`, marking a beta-stage export: no body, never alongside
 * `@alpha`.
 *
 * @experimental
 */
export const beta = createTagPreset({
  name: "beta",
  body: "none",
  excludes: ["alpha"],
});
