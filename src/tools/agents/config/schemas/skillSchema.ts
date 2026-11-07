import {
  array,
  boolean,
  looseObject,
  optional,
  picklist,
  strictObject,
  string,
} from "valibot";

export const skillSchema = looseObject({
  invocation: optional(picklist(["explicit", "implicit"]), "implicit"),
  agent: optional(
    strictObject({
      name: string(),
      description: string(),
      model: optional(string()),
      effort: optional(picklist(["low", "medium", "high", "xhigh", "max"])),
      disallowedTools: optional(array(string())),
      gate: optional(boolean()),
    }),
  ),
});
