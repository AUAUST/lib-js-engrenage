import { object, optional, string } from "valibot";

import {
  readHookPayload,
  resolveAgentStatsDirectory,
  resolveClaudeAgentTranscript,
  startAgentRun,
} from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";

const payloadSchema = object({
  cwd: string(),
  session_id: string(),
  agent_id: string(),
  agent_type: string(),
  transcript_path: string(),
  agent_transcript_path: optional(string()),
});

export default async function (): Promise<void> {
  const {
    cwd,
    session_id: session,
    agent_id: agent,
    agent_type: role,
    transcript_path: transcript,
    agent_transcript_path: agentTranscript,
  } = await readHookPayload(payloadSchema, "Claude Code");

  await startAgentRun(
    await resolveAgentStatsDirectory(cwd, getRunContext().reporter),
    {
      session,
      agent,
      role,
      transcript: (
        agentTranscript ??
        resolveClaudeAgentTranscript({
          session,
          agent,
          transcript,
        })
      ),
    },
  );
}
