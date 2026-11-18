import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@typeParam`: a type parameter name, which lint checks against the
 * signature, and a text body, repeatable.
 *
 * @experimental
 */
export const typeParam = createTagPreset({
  name: "typeParam",
  subject: "typeParameter",
  body: "text",
  multiple: true,
});
