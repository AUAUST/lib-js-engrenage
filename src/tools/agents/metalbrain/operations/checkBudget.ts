import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  budgetExtension,
  statsDirectory,
} from "#tools/agents/metalbrain/constants";
import { readBudgets } from "#tools/agents/metalbrain/operations/readBudgets";
import { readFirstPrompt } from "#tools/agents/metalbrain/operations/readFirstPrompt";
import { readIssuingMessage } from "#tools/agents/metalbrain/operations/readIssuingMessage";
import { isBudgetLevel } from "#tools/agents/metalbrain/utils/isBudgetLevel";
import { isMissingFile } from "#tools/agents/metalbrain/utils/isMissingFile";
import { parseBudgetState } from "#tools/agents/metalbrain/utils/parseBudgetState";
import { resolveTranscript } from "#tools/agents/metalbrain/utils/resolveTranscript";
import type { BudgetLevel } from "#tools/agents/metalbrain/types/BudgetLevel";
import type { BudgetState } from "#tools/agents/metalbrain/types/BudgetState";
import type { HookAction } from "#tools/agents/metalbrain/types/HookAction";
import type { File } from "#types/File";

const budgetLine = /^Budget:\s*(?<level>\S+)\s*$/mv;

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

async function readLevel(
  transcript: File,
  fallback: BudgetLevel,
): Promise<BudgetLevel> {
  const level = budgetLine.exec((await readFirstPrompt(transcript)) ?? "")
    ?.groups?.level;

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
 * call against the budget of its brief's `Budget:` level, or of `fallback`, and
 * returns a warning, logged in its budget state, each time the gain crosses the
 * budget or a further half of it.
 */
export function checkBudget(fallback: BudgetLevel): HookAction {
  return async (payload, { root, time }) => {
    const { session, agent, toolUse } = payload;

    if (agent === undefined) {
      return;
    }

    const transcript = resolveTranscript(payload);

    const found = await readIssuingMessage(transcript, toolUse);

    if (found === undefined) {
      return;
    }

    const { context } = found.issuing;

    const directory = join(root, statsDirectory, session);

    const file = join(directory, `${agent}${budgetExtension}`);

    const stored = await readState(file);

    if (stored === undefined) {
      const level = await readLevel(transcript, fallback);

      const { levels } = await readBudgets();

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
