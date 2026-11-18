import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@since`: one line naming the version that introduced the export.
 *
 * @experimental
 */
export const since = createTagPreset({
  name: "since",
  body: "inline",
});
