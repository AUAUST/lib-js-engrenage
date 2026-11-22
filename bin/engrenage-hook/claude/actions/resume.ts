import { object, string } from "valibot";

import { denyToolUse, resolveHookDirectory } from "#metalbrain/runtimes/index";
import { checkAgentResume, validateHookPayload } from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  session_id: string(),
  tool_input: object({
    to: string(),
  }),
});

export default async function (payload: unknown): Promise<boolean> {
  const {
    cwd,
    session_id: session,
    tool_input: { to: recipient },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(
    await resolveMainWorktree(resolveHookDirectory(cwd)),
    { reporter: getRunContext().reporter },
  );

  const reason = await checkAgentResume(config, { session, recipient });

  if (reason === undefined) {
    return false;
  }

  denyToolUse(reason);

  return true;
}
