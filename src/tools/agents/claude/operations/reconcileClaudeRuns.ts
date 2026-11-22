import { readdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { isMissingError, resolveWithin } from "#foundation/filesystem/index";
import {
  readClaudeAgentMeta,
  readRunningAgents,
  resolveAgentRunFile,
} from "#metalbrain/runtimes/index";
import { recordClaudeRun } from "#tools/agents/claude/operations/recordClaudeRun";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

async function listDirectory(directory: Directory): Promise<readonly string[]> {
  try {
    return await readdir(directory);
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }
}

// @debt relies on Claude Code's undocumented `projects/<project>/<session>/subagents` layout to find a legacy marker's transcript
async function findLegacyTranscript(
  session: string,
  agent: string,
): Promise<File | undefined> {
  const projects = join(
    process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"),
    "projects",
  );

  for (const project of await listDirectory(projects)) {
    const subagents = join(projects, project, session, "subagents");

    const file = `agent-${agent}.jsonl`;

    const files = await listDirectory(subagents);

    if (files.includes(file)) {
      return join(subagents, file);
    }
  }
}

/**
 * Records the runs of the given sessions whose marker remains though Claude Code
 * marks them finished, as runs ended without a stop event.
 */
export async function reconcileClaudeRuns(
  directory: Directory,
  sessions: readonly string[],
): Promise<void> {
  for (const session of sessions) {
    const markers = await readRunningAgents(resolveWithin(directory, session));

    for (const { agent, role, transcript: marked } of markers) {
      const transcript = marked ?? (await findLegacyTranscript(session, agent));

      if (transcript === undefined) {
        continue;
      }

      const meta = await readClaudeAgentMeta(transcript);

      if (meta?.finished !== true) {
        continue;
      }

      await recordClaudeRun(
        directory,
        {
          runtime: "claude",
          session,
          agent,
          role,
        },
        transcript,
        {
          stopped: false,
        },
      );

      await rm(resolveAgentRunFile(directory, { session, agent }, "running"), {
        force: true,
      });
    }
  }
}
