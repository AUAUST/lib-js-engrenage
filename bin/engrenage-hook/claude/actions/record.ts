import { object, optional, string } from "valibot";

import { isMissingError } from "#foundation/filesystem/index";
import {
  mainAgent,
  readClaudeTranscript,
  readHookPayload,
  writeAgentRun,
} from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  session_id: string(),
  transcript_path: string(),
  agent_id: optional(string()),
  agent_type: optional(string()),
  agent_transcript_path: optional(string()),
});

export default async function (): Promise<void> {
  const {
    session_id: session,
    transcript_path: transcript,
    agent_id: agent = mainAgent,
    agent_type: role = mainAgent,
    agent_transcript_path: agentTranscript = transcript,
  } = await readHookPayload(payloadSchema, "Claude Code");

  // @debt Claude Code fires SubagentStop for agents it never writes a transcript for, which agents is unknown, so a missing transcript is skipped instead of identified
  const usage = await readClaudeTranscript(agentTranscript).catch(
    (error: unknown) => {
      if (isMissingError(error)) {
        return;
      }

      throw error;
    },
  );

  if (usage === undefined) {
    return;
  }

  const config = await loadValidatedConfig(
    await resolveMainWorktree(process.cwd()),
    { reporter: getRunContext().reporter },
  );

  const resources = await config.resolve("resources");

  await writeAgentRun(resources.path("agents.stats"), {
    runtime: "claude",
    session,
    agent,
    role,
    ...usage,
  });
}
