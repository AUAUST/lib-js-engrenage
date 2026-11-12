import {
  array,
  boolean,
  looseObject,
  optional,
  picklist,
  strictObject,
  string,
} from "valibot";

const effortSchema = picklist(["low", "medium", "high", "xhigh", "max"]);

export const skillSchema = looseObject({
  invocation: optional(picklist(["explicit", "implicit"]), "implicit"),
  agent: optional(
    strictObject({
      name: string(),
      description: string(),
      model: optional(string()),
      effort: optional(effortSchema),
      // @debt the keys restate the `complexity` option meanings the GitHub issue contract owns.
      efforts: optional(
        strictObject({
          trivial: optional(effortSchema),
          involved: optional(effortSchema),
          complex: optional(effortSchema),
        }),
      ),
      disallowedTools: optional(array(string())),
      gate: optional(boolean()),
    }),
  ),
});
