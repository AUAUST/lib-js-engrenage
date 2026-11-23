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

import { efforts } from "#metalbrain/runtimes/constants";
import { thoroughnessLevels } from "#metalbrain/runtimes/hooks/index";

const effortSchema = picklist(efforts);

// @debt the agent block moves to the instruction registry with the agents' own entries
export const skillSchema = looseObject({
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
      thoroughness: optional(picklist(thoroughnessLevels)),
      ceiling: optional(pipe(number(), integer(), minValue(1))),
    }),
  ),
});
