import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@experimental`, marking an export whose contract may still change:
 * no body, never alongside `@stable`.
 *
 * @experimental
 */
export const experimental = createTagPreset({
  name: "experimental",
  body: "none",
  excludes: ["stable"],
});
