import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  budgetExtension,
  statsDirectory,
} from "#tools/agents/metalbrain/constants";
import { readAppendedLines } from "#tools/agents/metalbrain/operations/readAppendedLines";
import { readBudgets } from "#tools/agents/metalbrain/operations/readBudgets";
import { readFirstPrompt } from "#tools/agents/metalbrain/operations/readFirstPrompt";
import { readLatestContext } from "#tools/agents/metalbrain/operations/readLatestContext";
import { isBudgetLevel } from "#tools/agents/metalbrain/utils/isBudgetLevel";
import { isMissingFile } from "#tools/agents/metalbrain/utils/isMissingFile";
import { isRecord } from "#tools/agents/metalbrain/utils/isRecord";
import { parseBudgetState } from "#tools/agents/metalbrain/utils/parseBudgetState";
import { parseTranscriptLine } from "#tools/agents/metalbrain/utils/parseTranscriptLine";
import { readPromptText } from "#tools/agents/metalbrain/utils/readPromptText";
import { resolveTranscript } from "#tools/agents/metalbrain/utils/resolveTranscript";
import type { BudgetLevel } from "#tools/agents/metalbrain/types/BudgetLevel";
import type { BudgetState } from "#tools/agents/metalbrain/types/BudgetState";
import type { HookAction } from "#tools/agents/metalbrain/types/HookAction";
import type { File } from "#types/File";

const budgetLine = /^Budget:\s*(?<level>\w+)\s*$/gmv;

const budgetMention = /\bBudget:\s*(?<level>\w+)\b/gv;

async function readState(file: File): Promise<BudgetState | undefined> {
  try {
    return parseBudgetState(JSON.parse(await readFile(file, "utf-8")));
  } catch (error) {
    if (isMissingFile(error)) {
      return;
    }

    throw error;
  }
}

function findLastLevel(
  prompt: string,
  pattern: RegExp,
  known: readonly string[],
): string | undefined {
  return Array.from(prompt.matchAll(pattern), (match) => {
    return match.groups?.level;
  })
    .filter((level) => {
      return level !== undefined && known.includes(level);
    })
    .at(-1);
}

/**
 * The level a brief names: the last known level on a `Budget:` line of its own,
 * otherwise the last one named anywhere, otherwise `fallback`.
 */
async function readLevel(
  transcript: File,
  known: readonly string[],
  fallback: BudgetLevel,
): Promise<BudgetLevel> {
  const prompt = (await readFirstPrompt(transcript)) ?? "";

  const level = (
    findLastLevel(prompt, budgetLine, known) ??
    findLastLevel(prompt, budgetMention, known)
  );

  return isBudgetLevel(level) ? level : fallback;
}

/**
 * The warnings a gain calls for: one on reaching the budget, then one at each
 * further half of it.
 */
function countThresholds(gain: number, budget: number): number {
  return gain < budget ? 0 : Math.floor((gain - budget) / (budget / 2)) + 1;
}

// @debt reads Claude's transcript entries, whose format Claude does not document as a contract: a caller's message is a prompt not marked meta, or one marked meta with a `coordinator` origin
/**
 * Whether transcript lines hold a message from the agent's caller: a brief, a
 * resume or a message sent while it runs.
 */
function hasCallerMessage(text: string): boolean {
  return text.split("\n").some((line) => {
    const entry = parseTranscriptLine(line);

    const prompt = readPromptText(entry);

    if (!isRecord(entry) || prompt === undefined || prompt === "") {
      return false;
    }

    return (
      entry.isMeta !== true ||
      (isRecord(entry.origin) && entry.origin.kind === "coordinator")
    );
  });
}

async function writeState(file: File, state: BudgetState): Promise<void> {
  await writeFile(file, `${JSON.stringify(state)}\n`);
}

/**
 * PreToolUse, for a subagent: measures the context it gained since the first
 * measured call of its current contact, opened by its brief or its caller's
 * latest message, from the latest assistant message its transcript holds, against
 * the budget of its brief's `Budget:` level, or of `fallback`, and returns a
 * warning, logged in its budget state, each time the gain crosses the budget or
 * a further half of it within the contact.
 */
// @debt runs synchronously on every subagent tool call, and a metalbrain hook takes ~167 ms per call; its share of agent wall time is unmeasured
export function checkBudget(fallback: BudgetLevel): HookAction {
  return async (payload, { root, time }) => {
    const { session, agent } = payload;

    if (agent === undefined) {
      return;
    }

    const transcript = resolveTranscript(payload);

    // @debt measures the context up to one message late, as Claude Code at times writes the issuing message only after PreToolUse and its payload carries no context size
    const context = await readLatestContext(transcript);

    if (context === undefined) {
      return;
    }

    const directory = join(root, statsDirectory, session);

    const file = join(directory, `${agent}${budgetExtension}`);

    const stored = await readState(file);

    const appended = await readAppendedLines(transcript, stored?.scanned ?? 0);

    if (appended === undefined) {
      return;
    }

    if (stored === undefined) {
      const { levels } = await readBudgets();

      const level = await readLevel(transcript, Object.keys(levels), fallback);

      await mkdir(directory, { recursive: true });

      await writeState(file, {
        level,
        budget: levels[level],
        warnings: [],
        start: context,
        opened: 0,
        scanned: appended.end,
      });

      return;
    }

    const { level, budget, warnings, start, opened, scanned } = stored;

    if (hasCallerMessage(appended.text)) {
      return void (await writeState(file, {
        ...stored,
        start: context,
        opened: warnings.length,
        scanned: appended.end,
      }));
    }

    const gain = context - start;

    const last = warnings.slice(opened).at(-1);

    if (
      countThresholds(gain, budget) <=
      (last === undefined ? 0 : countThresholds(last.gain, budget))
    ) {
      if (appended.end !== scanned) {
        await writeState(file, { ...stored, scanned: appended.end });
      }

      return;
    }

    await writeState(file, {
      ...stored,
      warnings: [...warnings, { time: new Date(time).toISOString(), gain }],
      scanned: appended.end,
    });

    return `Budget: ${gain} tokens gained past the ${level} budget of ${budget}. Finish the step under way, then stop and report as a budget stop.`;
  };
}
