import { looseObject, optional, string } from "valibot";

import {
  findOutputOverrun,
  resolveHookDirectory,
  validateHookPayload,
  writeHookContext,
} from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = looseObject({
  cwd: string(),
  tool_response: looseObject({
    stdout: optional(string(), ""),
    stderr: optional(string(), ""),
  }),
});

export default async function (payload: unknown): Promise<void> {
  const {
    cwd,
    tool_response: { stdout, stderr },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(resolveHookDirectory(cwd), {
    reporter: getRunContext().reporter,
  });

  const { outputLimit } = await config.resolve("agents");

  const context = findOutputOverrun(`${stdout}${stderr}`, outputLimit);

  if (context !== undefined) {
    writeHookContext({
      event: "PostToolUse",
      context,
    });
  }
}
