import {
  isMissingError,
  readTextFile,
  resolveWithin,
} from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { thoroughnessExtension } from "#metalbrain/runtimes/constants";
import { parseThoroughnessState } from "#metalbrain/runtimes/hooks/index";
import { readClaudeTranscript } from "#metalbrain/runtimes/operations/readClaudeTranscript";
import { writeAgentRun } from "#metalbrain/runtimes/operations/writeAgentRun";
import { summarizeAgentCalls } from "#metalbrain/runtimes/utils/summarizeAgentCalls";
import { summarizeAgentTask } from "#metalbrain/runtimes/utils/summarizeAgentTask";
import type { IssueFinder } from "#metalbrain/runtimes/ports/IssueFinder";
import type { AgentRun } from "#metalbrain/runtimes/types/AgentRun";
import type { AgentRunThoroughness } from "#metalbrain/runtimes/types/AgentRunThoroughness";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

async function readRunThoroughness(
  directory: Directory,
  { session, agent }: Pick<AgentRun, "session" | "agent">,
): Promise<{ thoroughness?: AgentRunThoroughness }> {
  const path = resolveWithin(
    directory,
    session,
    `${agent}${thoroughnessExtension}`,
  );

  const content = await readTextFile(path);

  if (content === undefined) {
    return {};
  }

  // @debt a malformed thoroughness state file throws here and drops the whole run record; reporting it and recording the run without `thoroughness` would lose only the thoroughness columns
  const {
    level,
    limit,
    warnings,
  } = parseThoroughnessState(parseJson(content, path));

  return {
    thoroughness: {
      level,
      limit,
      warnings,
    },
  };
}

export async function recordClaudeRun(
  directory: Directory,
  run: Pick<AgentRun, "runtime" | "session" | "agent" | "role">,
  transcript: File,
  { findIssue, ...options }: { findIssue: IssueFinder; stopped?: boolean },
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
          ...summarizeAgentTask(run, read, findIssue),
          ...(await readRunThoroughness(directory, run)),
        },
        options,
      );
}
