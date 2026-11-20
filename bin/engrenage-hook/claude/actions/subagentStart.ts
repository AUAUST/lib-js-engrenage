import { object, optional, string } from "valibot";

import {
  readHookPayload,
  resolveClaudeAgentTranscript,
  resolveHookDirectory,
  startAgentRun,
} from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

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

  const config = await loadValidatedConfig(
    await resolveMainWorktree(resolveHookDirectory(cwd)),
    { reporter: getRunContext().reporter },
  );

  const resources = await config.resolve("resources");

  await startAgentRun(resources.path("agents.stats"), {
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
