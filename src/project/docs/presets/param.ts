import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@param`: a parameter name, which lint checks against the signature,
 * and a text body, repeatable.
 *
 * @experimental
 */
export const param = createTagPreset({
  name: "param",
  subject: "parameter",
  body: "text",
  multiple: true,
});
