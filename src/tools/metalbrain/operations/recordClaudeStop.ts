import { join } from "node:path";

import { object, optional, string } from "valibot";

import {
  mainAgent,
  statsDirectory,
  validateHookPayload,
  type HookContext,
} from "#metalbrain/runtimes/index";
import { reconcileClaudeRuns, recordClaudeRun } from "#tools/agents/index";

const payloadSchema = object({
  session_id: string(),
  transcript_path: string(),
  agent_id: optional(string()),
  agent_type: optional(string()),
  agent_transcript_path: optional(string()),
});

/**
 * Stop and SubagentStop: records the stopped agent's run under the agent stats,
 * and on the main agent's stop, the session's runs that ended without a stop.
 */
export async function recordClaudeStop(
  payload: unknown,
  { root }: HookContext,
): Promise<void> {
  const {
    session_id: session,
    transcript_path: transcript,
    agent_id: agent = mainAgent,
    agent_type: role = mainAgent,
    agent_transcript_path: agentTranscript = transcript,
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const directory = join(root, statsDirectory);

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
