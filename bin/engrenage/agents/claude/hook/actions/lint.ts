import { object, string } from "valibot";

import { readHookPayload, writeHookContext } from "#tools/agents/index";
import { MissingEslintError } from "#tools/eslint/errors/MissingEslintError";
import { formatInfoMessages, listInfoMessages } from "#tools/eslint/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  tool_input: object({
    file_path: string(),
  }),
});

async function reportInfoMessages() {
  const {
    cwd,
    tool_input: { file_path: file },
  } = await readHookPayload(payloadSchema, "Claude Code");

  const context = formatInfoMessages(
    file,
    await listInfoMessages(await loadValidatedConfig(cwd), file),
  );

  if (context !== undefined) {
    writeHookContext({
      event: "PostToolUse",
      context,
    });
  }
}

export default async function (): Promise<void> {
  try {
    await reportInfoMessages();
  } catch (error) {
    if (error instanceof MissingEslintError) {
      return;
    }

    // @debt Every other failure is swallowed without a diagnostic, so a broken config or ESLint crash goes unnoticed; report it without disturbing the session.
    process.exitCode = 0;
  }
}
