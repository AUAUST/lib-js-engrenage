import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@packageDocumentation`, marking the comment documenting the package:
 * no body.
 *
 * @experimental
 */
export const packageDocumentation = createTagPreset({
  name: "packageDocumentation",
  body: "none",
});
