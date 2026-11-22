import {
  array,
  boolean,
  integer,
  looseObject,
  minValue,
  number,
  optional,
  picklist,
  pipe,
  strictObject,
  string,
} from "valibot";

import { efforts } from "#tools/agents/constants";
import { budgetLevels } from "#tools/agents/metalbrain/constants";

const effortSchema = picklist(efforts);

export const skillSchema = looseObject({
  invocation: optional(picklist(["explicit", "implicit"]), "implicit"),
  formerly: optional(array(string())),
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
      // @debt `tools` and `disallowedTools` name Claude Code tools, so the shared agent definition carries one runtime's vocabulary.
      tools: optional(array(string())),
      disallowedTools: optional(array(string())),
      gate: optional(boolean()),
      budget: optional(picklist(budgetLevels)),
      ceiling: optional(pipe(number(), integer(), minValue(1))),
    }),
  ),
});
