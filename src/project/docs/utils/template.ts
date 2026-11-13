import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@template`: a type parameter name, which lint checks against the
 * signature, and a text body, repeatable.
 *
 * @experimental
 */
export const template = createTagPreset({
  name: "template",
  subject: "typeParameter",
  body: "text",
  multiple: true,
});
