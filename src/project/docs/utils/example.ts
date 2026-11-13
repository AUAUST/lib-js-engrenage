import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const example = createTagPreset({
  name: "example",
  body: "code",
  multiple: true,
});
