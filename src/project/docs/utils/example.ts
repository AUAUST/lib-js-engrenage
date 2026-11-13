import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@example`: a code body whose lines are kept verbatim, repeatable.
 *
 * @experimental
 */
export const example = createTagPreset({
  name: "example",
  body: "code",
  multiple: true,
});
