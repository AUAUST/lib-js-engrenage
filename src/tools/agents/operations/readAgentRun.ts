import {
  exactOptional,
  integer,
  minValue,
  number,
  object,
  pipe,
  record,
  string,
  type GenericSchema,
} from "valibot";

import { readTextFile } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { File } from "#types/File";

const count = pipe(number(), integer(), minValue(0));

const runSchema: GenericSchema<unknown, AgentRun> = object({
  runtime: string(),
  session: string(),
  agent: string(),
  role: string(),
  stops: count,
  issue: exactOptional(string()),
  model: exactOptional(string()),
  started: exactOptional(string()),
  ended: exactOptional(string()),
  turns: count,
  tools: record(string(), count),
  tokens: object({
    input: count,
    cacheRead: count,
    cacheWrite5m: count,
    cacheWrite1h: count,
    output: count,
  }),
  startContext: count,
  peakContext: count,
});

export async function readAgentRun(path: File): Promise<AgentRun | undefined> {
  const content = await readTextFile(path);

  return content === undefined
    ? undefined
    : validate(runSchema, parseJson(content, path), path);
}
