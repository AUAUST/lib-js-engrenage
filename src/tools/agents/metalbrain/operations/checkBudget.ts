import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  budgetExtension,
  statsDirectory,
} from "#tools/agents/metalbrain/constants";
import { readBudgets } from "#tools/agents/metalbrain/operations/readBudgets";
import { readFirstPrompt } from "#tools/agents/metalbrain/operations/readFirstPrompt";
import { readLatestContext } from "#tools/agents/metalbrain/operations/readLatestContext";
import { isBudgetLevel } from "#tools/agents/metalbrain/utils/isBudgetLevel";
import { isMissingFile } from "#tools/agents/metalbrain/utils/isMissingFile";
import { parseBudgetState } from "#tools/agents/metalbrain/utils/parseBudgetState";
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

/**
 * PreToolUse, for a subagent: measures the context it gained since its first
 * measured call, from the latest assistant message its transcript holds, against
 * the budget of its brief's `Budget:` level, or of `fallback`, and returns a
 * warning, logged in its budget state, each time the gain crosses the budget
 * or a further half of it.
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

    if (stored === undefined) {
      const { levels } = await readBudgets();

      const level = await readLevel(transcript, Object.keys(levels), fallback);

      const state: BudgetState = {
        start: context,
        level,
        budget: levels[level],
        warnings: [],
      };

      await mkdir(directory, { recursive: true });

      await writeFile(file, `${JSON.stringify(state)}\n`);

      return;
    }

    const { start, level, budget, warnings } = stored;

    const gain = context - start;

    const last = warnings.at(-1);

    if (
      countThresholds(gain, budget) <=
      (last === undefined ? 0 : countThresholds(last.gain, budget))
    ) {
      return;
    }

    const state: BudgetState = {
      ...stored,
      warnings: [...warnings, { time: new Date(time).toISOString(), gain }],
    };

    await writeFile(file, `${JSON.stringify(state)}\n`);

    return `Budget: ${gain} tokens gained past the ${level} budget of ${budget}. Finish the step under way, then stop and report as a budget stop.`;
  };
}
