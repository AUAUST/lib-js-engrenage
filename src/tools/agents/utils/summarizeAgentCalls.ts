import { max } from "@auaust/toolkit/math";

import type {
  AgentCacheLoss,
  AgentCall,
  AgentCallGaps,
  AgentLargestResult,
  AgentModelUsage,
  AgentResultTotals,
  AgentTokens,
  AgentTranscript,
  AgentUsage,
} from "#metalbrain/runtimes/index";

const largestCount = 5;

const minute = 60_000;

const cacheTtl = 5 * minute;

const hour = 60 * minute;

type Mutable<Shape> = { -readonly [Key in keyof Shape]: Shape[Key] };

function addTokens(left: AgentTokens, right: AgentTokens): AgentTokens {
  return {
    input: left.input + right.input,
    cacheRead: left.cacheRead + right.cacheRead,
    cacheWrite5m: left.cacheWrite5m + right.cacheWrite5m,
    cacheWrite1h: left.cacheWrite1h + right.cacheWrite1h,
    output: left.output + right.output,
  };
}

function summarizeModels(calls: readonly AgentCall[]): AgentModelUsage[] {
  const models = new Map<string, AgentModelUsage>();

  for (const { model, tier, tokens } of calls) {
    const key = `${model}\n${tier}`;

    const previous = models.get(key);

    models.set(
      key,
      previous === undefined
        ? {
            model,
            tier,
            calls: 1,
            tokens,
          }
        : {
            ...previous,
            calls: previous.calls + 1,
            tokens: addTokens(previous.tokens, tokens),
          },
    );
  }

  return [...models.values()];
}

function bucketGap(gaps: Mutable<AgentCallGaps>, gap: number): void {
  if (gap < minute) {
    gaps.under1m += 1;
  } else if (gap <= cacheTtl) {
    gaps.upTo5m += 1;
  } else if (gap <= hour) {
    gaps.upTo60m += 1;
  } else {
    gaps.over60m += 1;
  }
}

function measureGap(previous: AgentCall, call: AgentCall): number | undefined {
  return previous.at === undefined || call.at === undefined
    ? undefined
    : Date.parse(call.at) - Date.parse(previous.at);
}

// @debt `at` is a response timestamp, so gaps include generation time and only approximate request starts
export function summarizeAgentCalls({
  calls,
  compactions,
  started,
  ended,
}: AgentTranscript): AgentUsage {
  const tools: Record<string, number> = {};

  const results: Record<string, Mutable<AgentResultTotals>> = {};

  const largest: AgentLargestResult[] = [];

  const gaps: Mutable<AgentCallGaps> = {
    under1m: 0,
    upTo5m: 0,
    upTo60m: 0,
    over60m: 0,
  };

  const ttl5m: Mutable<AgentCacheLoss> = { count: 0, tokens: 0 };

  const misses: Mutable<AgentCacheLoss> = { count: 0, tokens: 0 };

  let thinking = 0;
  let batched = 0;
  let peakContext = 0;

  for (const [index, call] of calls.entries()) {
    thinking += call.thinking;

    peakContext = max(peakContext, call.context);

    if (call.results.length >= 2) {
      batched += 1;
    }

    for (const { name, family, chars } of call.results) {
      tools[name] = (tools[name] ?? 0) + 1;

      const totals = (results[family] ??= { count: 0, chars: 0 });

      totals.count += 1;
      totals.chars += chars;

      largest.push({
        family,
        chars,
        call: index,
      });
    }

    const previous = calls[index - 1];

    if (previous === undefined) {
      continue;
    }

    const gap = measureGap(previous, call);

    if (gap !== undefined) {
      bucketGap(gaps, gap);
    }

    if (gap !== undefined && gap > cacheTtl) {
      ttl5m.count += 1;
      ttl5m.tokens += call.tokens.cacheRead;
    }

    const prefix = (
      previous.tokens.cacheRead +
      previous.tokens.cacheWrite5m +
      previous.tokens.cacheWrite1h
    );

    if (call.tokens.cacheRead >= prefix) {
      continue;
    }

    misses.count += 1;
    misses.tokens += prefix - call.tokens.cacheRead;
  }

  return {
    ...(started === undefined ? {} : { started }),
    ...(ended === undefined ? {} : { ended }),
    turns: calls.length,
    tools,
    models: summarizeModels(calls),
    startContext: calls[0]?.context ?? 0,
    peakContext,
    results,
    largestResults: largest
      .toSorted((left, right) => right.chars - left.chars)
      .slice(0, largestCount),
    thinking,
    batched,
    gaps,
    ttl5m,
    misses,
    compactions,
  };
}
