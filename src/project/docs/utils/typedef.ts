import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * Declares `@typedef`: a required `{type}` and the name of the type it declares,
 * no body.
 *
 * @experimental
 */
export const typedef = createTagPreset({
  name: "typedef",
  type: "required",
  subject: "name",
  body: "none",
});
