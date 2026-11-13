import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@property`: an optional `{type}`, a property name and a text body,
 * repeatable.
 *
 * @experimental
 */
export const property = createTagPreset({
  name: "property",
  type: "optional",
  subject: "name",
  body: "text",
  multiple: true,
});
