import { join } from "node:path";

import { object, optional, string } from "valibot";

import {
  resolveClaudeAgentTranscript,
  startAgentRun,
  statsDirectory,
  validateHookPayload,
  type HookContext,
} from "#metalbrain/runtimes/index";

const payloadSchema = object({
  session_id: string(),
  agent_id: string(),
  agent_type: string(),
  transcript_path: string(),
  agent_transcript_path: optional(string()),
});

/**
 * SubagentStart: marks the started subagent as running under the agent stats
 * until its next stop.
 */
export async function startClaudeRun(
  payload: unknown,
  { root }: HookContext,
): Promise<void> {
  const {
    session_id: session,
    agent_id: agent,
    agent_type: role,
    transcript_path: transcript,
    agent_transcript_path: agentTranscript,
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  await startAgentRun(join(root, statsDirectory), {
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
  });
}
