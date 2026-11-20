import { object, optional, string } from "valibot";

import {
  mainAgent,
  readHookPayload,
  recordClaudeRun,
  resolveHookDirectory,
} from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

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

  // @debt restates `subagentStart`'s config loading to resolve the stats directory; one shared resolver would own it
  const config = await loadValidatedConfig(
    await resolveMainWorktree(resolveHookDirectory(cwd)),
    { reporter: getRunContext().reporter },
  );

  const resources = await config.resolve("resources");

  await recordClaudeRun(
    resources.path("agents.stats"),
    {
      runtime: "claude",
      session,
      agent,
      role,
    },
    agentTranscript,
  );
}
