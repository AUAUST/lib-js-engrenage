import { object, optional, string } from "valibot";

import { mainAgent } from "#metalbrain/runtimes/constants";
import {
  reconcileClaudeRuns,
  recordClaudeRun,
} from "#tools/agents/claude/index";
import { readHookPayload } from "#tools/agents/index";
import { resolveAgentStatsDirectory } from "#tools/metalbrain/index";
import { getRunContext } from "#workflows/cli/index";

const payloadSchema = object({
  cwd: string(),
  session_id: string(),
  transcript_path: string(),
  agent_id: optional(string()),
  agent_type: optional(string()),
  agent_transcript_path: optional(string()),
});

export default async function (): Promise<void> {
  const {
    cwd,
    session_id: session,
    transcript_path: transcript,
    agent_id: agent = mainAgent,
    agent_type: role = mainAgent,
    agent_transcript_path: agentTranscript = transcript,
  } = await readHookPayload(payloadSchema, "Claude Code");

  const directory = await resolveAgentStatsDirectory(
    cwd,
    getRunContext().reporter,
  );

  await recordClaudeRun(
    directory,
    {
      runtime: "claude",
      session,
      agent,
      role,
    },
    agentTranscript,
  );

  if (agent === mainAgent) {
    await reconcileClaudeRuns(directory, [session]);
  }
}
