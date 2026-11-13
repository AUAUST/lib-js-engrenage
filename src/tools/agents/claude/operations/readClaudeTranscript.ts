import { readFile } from "node:fs/promises";

import {
  array,
  looseObject,
  number,
  optional,
  safeParse,
  string,
  union,
} from "valibot";

import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";
import { max } from "@auaust/toolkit/math";

import { findBriefedIssue } from "#tools/github/index";
import type { AgentTokens } from "#tools/agents/types/AgentTokens";
import type { AgentUsage } from "#tools/agents/types/AgentUsage";
import type { File } from "#types/File";

const blockSchema = looseObject({
  type: string(),
  id: optional(string()),
  name: optional(string()),
  text: optional(string()),
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
          cache_read_input_tokens: optional(number(), 0),
          cache_creation_input_tokens: optional(number(), 0),
          cache_creation: optional(
            looseObject({
              ephemeral_5m_input_tokens: optional(number(), 0),
              ephemeral_1h_input_tokens: optional(number(), 0),
            }),
          ),
        }),
      ),
    }),
  ),
});

const syntheticModel = "<synthetic>";

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

// @debt reads Claude's transcript entries, whose format Claude does not document as a contract; a format change silently zeroes the counters
export async function readClaudeTranscript(path: File): Promise<AgentUsage> {
  const content = await readFile(path, "utf-8");

  const messages = new Set<string>();

  const toolUses = new Set<string>();

  const tools: Record<string, number> = {};

  const tokens: { -readonly [Key in keyof AgentTokens]: number } = {
    input: 0,
    cacheRead: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
    output: 0,
  };

  let issue: string | undefined;
  let model: string | undefined;
  let started: string | undefined;
  let ended: string | undefined;
  let briefed = false;
  let startContext = 0;
  let peakContext = 0;

  for (const line of content.split("\n")) {
    const parsed = safeParse(entrySchema, parseLine(line));

    if (!parsed.success) {
      continue;
    }

    const { type, timestamp, message } = parsed.output;

    if (timestamp !== undefined) {
      started ??= timestamp;

      ended = timestamp;
    }

    if (type === "user" && !briefed && message !== undefined) {
      briefed = true;

      const brief = isString(message.content)
        ? message.content
        : message.content?.find((block) => block.type === "text")?.text;

      const found = brief == null ? undefined : findBriefedIssue(brief);

      issue = found === undefined
        ? undefined
        : `${found.repository}#${found.number}`;
    }

    if (
      type !== "assistant" ||
      message?.id === undefined ||
      message.model === syntheticModel
    ) {
      continue;
    }

    for (const block of isArray(message.content) ? message.content : []) {
      if (
        block.type !== "tool_use" ||
        block.id === undefined ||
        block.name === undefined ||
        toolUses.has(block.id)
      ) {
        continue;
      }

      toolUses.add(block.id);

      tools[block.name] = (tools[block.name] ?? 0) + 1;
    }

    const { usage } = message;

    if (usage === undefined || messages.has(message.id)) {
      continue;
    }

    messages.add(message.id);

    model = message.model ?? model;

    const written = usage.cache_creation === undefined
      ? {
          short: usage.cache_creation_input_tokens,
          long: 0,
        }
      : {
          short: usage.cache_creation.ephemeral_5m_input_tokens,
          long: usage.cache_creation.ephemeral_1h_input_tokens,
        };

    tokens.input += usage.input_tokens;
    tokens.cacheRead += usage.cache_read_input_tokens;
    tokens.cacheWrite5m += written.short;
    tokens.cacheWrite1h += written.long;
    tokens.output += usage.output_tokens;

    const context = (
      usage.input_tokens +
      usage.cache_read_input_tokens +
      usage.cache_creation_input_tokens
    );

    if (messages.size === 1) {
      startContext = context;
    }

    peakContext = max(peakContext, context);
  }

  return {
    ...(issue === undefined ? {} : { issue }),
    ...(model === undefined ? {} : { model }),
    ...(started === undefined ? {} : { started }),
    ...(ended === undefined ? {} : { ended }),
    turns: messages.size,
    tools,
    tokens,
    startContext,
    peakContext,
  };
}
