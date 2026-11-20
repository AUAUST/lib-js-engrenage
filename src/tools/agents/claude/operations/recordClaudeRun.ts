import {
  isMissingError,
  readTextFile,
  resolveWithin,
} from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { readClaudeTranscript } from "#tools/agents/claude/operations/readClaudeTranscript";
import {
  budgetExtension,
  parseBudgetState,
} from "#tools/agents/metalbrain/index";
import { writeAgentRun } from "#tools/agents/operations/writeAgentRun";
import { summarizeAgentCalls } from "#tools/agents/utils/summarizeAgentCalls";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { AgentRunBudget } from "#tools/agents/types/AgentRunBudget";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

async function readRunBudget(
  directory: Directory,
  { session, agent }: Pick<AgentRun, "session" | "agent">,
): Promise<{ budget?: AgentRunBudget }> {
  const path = resolveWithin(directory, session, `${agent}${budgetExtension}`);

  const content = await readTextFile(path);

  if (content === undefined) {
    return {};
  }

  const {
    level,
    budget,
    warnings,
  } = parseBudgetState(parseJson(content, path));

  return {
    budget: {
      level,
      budget,
      warnings,
    },
  };
}

export async function recordClaudeRun(
  directory: Directory,
  run: Pick<AgentRun, "runtime" | "session" | "agent" | "role">,
  transcript: File,
  options?: { stopped?: boolean },
): Promise<AgentRun | undefined> {
  // @debt Claude Code fires SubagentStop for agents it never writes a transcript for, which agents is unknown, so a missing transcript is skipped instead of identified
  const read = await readClaudeTranscript(transcript).catch(
    (error: unknown) => {
      if (isMissingError(error)) {
        return;
      }

      throw error;
    },
  );

  return read === undefined
    ? undefined
    : writeAgentRun(
        directory,
        {
          ...run,
          ...summarizeAgentCalls(read),
          ...(await readRunBudget(directory, run)),
        },
        options,
      );
}
