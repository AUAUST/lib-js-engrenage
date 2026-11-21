import { readFile } from "node:fs/promises";

import {
  array,
  fallback,
  literal,
  looseObject,
  number,
  optional,
  safeParse,
  string,
  union,
} from "valibot";

import { isArray, isString } from "@auaust/toolkit";

import { fastTier, standardTier, unknownModel } from "#tools/agents/constants";
import {
  findModelFact,
  findPriceTier,
  readModelFacts,
  type ModelFacts,
} from "#tools/agents/metalbrain/index";
import { findCommandFamily } from "#tools/agents/utils/findCommandFamily";
import type { AgentCall } from "#tools/agents/types/AgentCall";
import type { AgentCompaction } from "#tools/agents/types/AgentCompaction";
import type { AgentToolResult } from "#tools/agents/types/AgentToolResult";
import type { AgentTranscript } from "#tools/agents/types/AgentTranscript";
import type { File } from "#types/File";

const textBlockSchema = looseObject({
  type: string(),
  text: optional(string()),
});

const blockSchema = looseObject({
  type: string(),
  id: optional(string()),
  name: optional(string()),
  text: optional(string()),
  input: fallback(
    optional(
      looseObject({
        command: fallback(optional(string()), undefined),
        message: fallback(optional(string()), undefined),
      }),
    ),
    undefined,
  ),
  tool_use_id: optional(string()),
  content: fallback(
    optional(union([string(), array(textBlockSchema)])),
    undefined,
  ),
});

const compactionSchema = looseObject({
  type: literal("system"),
  subtype: literal("compact_boundary"),
  timestamp: string(),
  compactMetadata: looseObject({
    trigger: string(),
    preTokens: number(),
    postTokens: number(),
  }),
});

const entrySchema = looseObject({
  type: string(),
  timestamp: optional(string()),
  message: optional(
    looseObject({
      id: optional(string()),
      model: optional(string()),
      content: optional(union([string(), array(blockSchema)])),
      usage: optional(
        looseObject({
          input_tokens: number(),
          output_tokens: number(),
          speed: optional(string()),
          cache_read_input_tokens: optional(number(), 0),
          cache_creation_input_tokens: optional(number(), 0),
          cache_creation: optional(
            looseObject({
              ephemeral_5m_input_tokens: optional(number(), 0),
              ephemeral_1h_input_tokens: optional(number(), 0),
            }),
          ),
          output_tokens_details: optional(
            looseObject({ thinking_tokens: optional(number(), 0) }),
          ),
        }),
      ),
    }),
  ),
});

const syntheticModel = "<synthetic>";

const handbackTool = "SubagentHandback";

interface ResultEntry extends AgentToolResult {
  chars: number;
}

interface CallEntry {
  readonly at: string | undefined;
  readonly results: ResultEntry[];
  call?: Omit<AgentCall, "at" | "results">;
}

function resolveTier(
  facts: ModelFacts,
  call: { model: string; speed: string | undefined; context: number },
): string {
  const fact = findModelFact(facts, call.model);

  const tier = fact === undefined ? undefined : findPriceTier(fact, call);

  return tier?.name ?? (call.speed === fastTier ? fastTier : standardTier);
}

function parseLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }
}

function measureContent(
  content:
    string | readonly { readonly text?: string | undefined }[] | undefined,
): number {
  if (content === undefined) {
    return 0;
  }

  return isString(content)
    ? content.length
    : content.reduce((sum, block) => sum + (block.text?.length ?? 0), 0);
}

// @debt reads Claude's transcript entries, whose format Claude does not document as a contract; a format change silently zeroes the counters
export async function readClaudeTranscript(
  path: File,
): Promise<AgentTranscript> {
  const content = await readFile(path, "utf-8");

  const facts = await readModelFacts();

  const entries = new Map<string, CallEntry>();

  const toolResults = new Map<string, ResultEntry>();

  const compactions: AgentCompaction[] = [];

  let brief: string | undefined;
  let report: string | undefined;
  let started: string | undefined;
  let ended: string | undefined;
  let briefed = false;

  for (const line of content.split("\n")) {
    const value = parseLine(line);

    const compaction = safeParse(compactionSchema, value);

    if (compaction.success) {
      const { timestamp, compactMetadata } = compaction.output;

      compactions.push({
        at: timestamp,
        trigger: compactMetadata.trigger,
        before: compactMetadata.preTokens,
        after: compactMetadata.postTokens,
      });
    }

    const parsed = safeParse(entrySchema, value);

    if (!parsed.success) {
      continue;
    }

    const { type, timestamp, message } = parsed.output;

    if (timestamp !== undefined) {
      started ??= timestamp;

      ended = timestamp;
    }

    if (type === "user" && message !== undefined) {
      if (!briefed) {
        briefed = true;

        brief = isString(message.content)
          ? message.content
          : message.content?.find((block) => block.type === "text")?.text;
      }

      for (const block of isArray(message.content) ? message.content : []) {
        const result = (
          block.type === "tool_result" && block.tool_use_id !== undefined
        )
          ? toolResults.get(block.tool_use_id)
          : undefined;

        if (result !== undefined) {
          result.chars = measureContent(block.content);
        }
      }
    }

    if (
      type !== "assistant" ||
      message?.id === undefined ||
      message.model === syntheticModel
    ) {
      continue;
    }

    const entry = entries.get(message.id) ?? { at: timestamp, results: [] };

    entries.set(message.id, entry);

    for (const block of isArray(message.content) ? message.content : []) {
      if (
        block.type === "text" &&
        block.text !== undefined &&
        block.text.trim() !== ""
      ) {
        report = block.text;
      } else if (block.type === "tool_use") {
        report = block.name === handbackTool ? block.input?.message : undefined;
      }

      if (
        block.type !== "tool_use" ||
        block.id === undefined ||
        block.name === undefined ||
        toolResults.has(block.id)
      ) {
        continue;
      }

      const result = {
        name: block.name,
        family: findCommandFamily(block.name, block.input?.command),
        chars: 0,
      };

      toolResults.set(block.id, result);

      entry.results.push(result);
    }

    const { usage } = message;

    if (usage === undefined || entry.call !== undefined) {
      continue;
    }

    const context = (
      usage.input_tokens +
      usage.cache_read_input_tokens +
      usage.cache_creation_input_tokens
    );

    const model = message.model ?? unknownModel;

    const written = usage.cache_creation === undefined
      ? {
          short: usage.cache_creation_input_tokens,
          long: 0,
        }
      : {
          short: usage.cache_creation.ephemeral_5m_input_tokens,
          long: usage.cache_creation.ephemeral_1h_input_tokens,
        };

    entry.call = {
      model,
      tier: resolveTier(facts, {
        model,
        speed: usage.speed,
        context,
      }),
      tokens: {
        input: usage.input_tokens,
        cacheRead: usage.cache_read_input_tokens,
        cacheWrite5m: written.short,
        cacheWrite1h: written.long,
        output: usage.output_tokens,
      },
      context,
      thinking: usage.output_tokens_details?.thinking_tokens ?? 0,
    };
  }

  const calls: AgentCall[] = [];

  for (const { at, results, call } of entries.values()) {
    if (call !== undefined) {
      calls.push({
        ...(at === undefined ? {} : { at }),
        ...call,
        results,
      });
    }
  }

  return {
    calls,
    compactions,
    ...(brief === undefined ? {} : { brief }),
    ...(report === undefined ? {} : { report }),
    ...(started === undefined ? {} : { started }),
    ...(ended === undefined ? {} : { ended }),
  };
}
