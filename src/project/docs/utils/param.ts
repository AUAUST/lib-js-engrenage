import { createTagPreset } from "#project/docs/utils/createTagPreset";

/**
 * @experimental
 */
export const param = createTagPreset({
  name: "param",
  subject: "parameter",
  body: "text",
  multiple: true,
});
