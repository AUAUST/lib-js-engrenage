import { object, string } from "valibot";

import { readHookPayload } from "#tools/agents/index";
import { listInfoMessages } from "#tools/eslint/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  tool_input: object({
    file_path: string(),
  }),
});

const lead = "Lint suggestions for the file you edited; apply those that fit.";

async function describeInfoMessages(): Promise<string | undefined> {
  const {
    cwd,
    tool_input: { file_path: file },
  } = await readHookPayload(payloadSchema, "Claude Code");

  const messages = await listInfoMessages(await loadValidatedConfig(cwd), file);

  if (messages.length === 0) {
    return;
  }

  return [
    lead,
    ...messages.map(({ line, column, message, ruleId }) => {
      return `${file}:${line}:${column} ${message} (${ruleId})`;
    }),
  ].join("\n");
}

export default async function (): Promise<void> {
  try {
    const additionalContext = await describeInfoMessages();

    if (additionalContext === undefined) {
      return;
    }

    process.stdout.write(
      `${JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext,
        },
      })}\n`,
    );
  } catch {
    // @debt Every failure is swallowed without a diagnostic, so a broken config or ESLint crash goes unnoticed; report it without disturbing the session.
    process.exitCode = 0;
  }
}
