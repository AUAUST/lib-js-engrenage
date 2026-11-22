import {
  array,
  exactOptional,
  integer,
  literal,
  minValue,
  number,
  object,
  optional,
  picklist,
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
import {
  agentOutcomes,
  standardTier,
  unknownModel,
} from "#metalbrain/runtimes/constants";
import { thoroughnessLevels } from "#metalbrain/runtimes/hooks/index";
import type { AgentRun } from "#metalbrain/runtimes/types/AgentRun";
import type { File } from "#types/File";

// @debt reads run records written before the budget-to-thoroughness rename; drop once no stats directory keeps one
const legacyThoroughness = "budget";

const count = pipe(number(), integer(), minValue(0));

const tokensSchema = object({
  input: count,
  cacheRead: count,
  cacheWrite5m: count,
  cacheWrite1h: count,
  output: count,
});

const cacheLossSchema = object({
  count,
  tokens: count,
});

const warningsSchema = array(
  object({
    time: string(),
    gain: number(),
  }),
);

const runEntries = {
  runtime: string(),
  session: string(),
  agent: string(),
  role: string(),
  stops: count,
  issue: exactOptional(string()),
  draft: exactOptional(string()),
  backlog: exactOptional(array(string())),
  outcome: exactOptional(
    union([
      picklist(agentOutcomes),
      pipe(
        literal(legacyThoroughness),
        transform(() => "thoroughness" as const),
      ),
    ]),
  ),
  started: exactOptional(string()),
  ended: exactOptional(string()),
  turns: count,
  tools: record(string(), count),
  startContext: count,
  peakContext: count,
  results: exactOptional(
    record(
      string(),
      object({
        count,
        chars: count,
      }),
    ),
  ),
  largestResults: exactOptional(
    array(
      object({
        family: string(),
        chars: count,
        call: count,
      }),
    ),
  ),
  thinking: exactOptional(count),
  batched: exactOptional(count),
  gaps: exactOptional(
    object({
      under1m: count,
      upTo5m: count,
      upTo60m: count,
      over60m: count,
    }),
  ),
  ttl5m: exactOptional(cacheLossSchema),
  misses: exactOptional(cacheLossSchema),
  thoroughness: exactOptional(
    object({
      level: picklist(thoroughnessLevels),
      limit: number(),
      warnings: warningsSchema,
    }),
  ),
  [legacyThoroughness]: exactOptional(
    pipe(
      object({
        level: picklist(thoroughnessLevels),
        budget: number(),
        warnings: warningsSchema,
      }),
      transform(({ budget, ...thoroughness }) => {
        return { ...thoroughness, limit: budget };
      }),
    ),
  ),
  compactions: exactOptional(
    array(
      object({
        at: string(),
        trigger: string(),
        before: count,
        after: count,
      }),
    ),
  ),
};

const legacyRunSchema = pipe(
  object({
    ...runEntries,
    model: exactOptional(string()),
    tokens: tokensSchema,
  }),
  transform(({ model = unknownModel, tokens, ...run }) => {
    return {
      ...run,
      models: [
        {
          model,
          tier: standardTier,
          calls: 0,
          tokens,
        },
      ],
    };
  }),
);

const runSchema: GenericSchema<unknown, AgentRun> = pipe(
  union([
    object({
      ...runEntries,
      models: array(
        object({
          model: string(),
          tier: string(),
          calls: optional(count, 0),
          tokens: tokensSchema,
        }),
      ),
    }),
    legacyRunSchema,
  ]),
  transform(({ [legacyThoroughness]: legacy, ...run }): AgentRun => {
    return legacy === undefined ? run : { ...run, thoroughness: legacy };
  }),
);

export async function readAgentRun(path: File): Promise<AgentRun | undefined> {
  const content = await readTextFile(path);

  return content === undefined
    ? undefined
    : validate(runSchema, parseJson(content, path), path);
}
