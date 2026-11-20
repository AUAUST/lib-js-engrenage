import {
  array,
  exactOptional,
  integer,
  minValue,
  number,
  object,
  pipe,
  record,
  string,
  transform,
  union,
  type GenericSchema,
} from "valibot";

import { readTextFile } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { standardTier, unknownModel } from "#tools/agents/constants";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { File } from "#types/File";

const count = pipe(number(), integer(), minValue(0));

const tokensSchema = object({
  input: count,
  cacheRead: count,
  cacheWrite5m: count,
  cacheWrite1h: count,
  output: count,
});

const runEntries = {
  runtime: string(),
  session: string(),
  agent: string(),
  role: string(),
  stops: count,
  issue: exactOptional(string()),
  started: exactOptional(string()),
  ended: exactOptional(string()),
  turns: count,
  tools: record(string(), count),
  startContext: count,
  peakContext: count,
};

const legacyRunSchema = pipe(
  object({
    ...runEntries,
    model: exactOptional(string()),
    tokens: tokensSchema,
  }),
  transform(({ model = unknownModel, tokens, ...run }): AgentRun => {
    return {
      ...run,
      models: [
        {
          model,
          tier: standardTier,
          tokens,
        },
      ],
    };
  }),
);

const runSchema: GenericSchema<unknown, AgentRun> = union([
  object({
    ...runEntries,
    models: array(
      object({
        model: string(),
        tier: string(),
        tokens: tokensSchema,
      }),
    ),
  }),
  legacyRunSchema,
]);

export async function readAgentRun(path: File): Promise<AgentRun | undefined> {
  const content = await readTextFile(path);

  return content === undefined
    ? undefined
    : validate(runSchema, parseJson(content, path), path);
}
