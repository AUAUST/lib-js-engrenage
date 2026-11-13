import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@stable`, marking an export whose contract is settled: no body, never
 * alongside `@experimental`.
 *
 * @experimental
 */
export const stable = createTagPreset({
  name: "stable",
  body: "none",
  excludes: ["experimental"],
});
