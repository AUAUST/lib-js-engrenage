import { text } from "node:stream/consumers";

import { object, string } from "valibot";

import {
  resolveHookDirectory,
  writeHookContext,
} from "#metalbrain/runtimes/index";
import { validateHookPayload } from "#tools/agents/index";
import { MissingEslintError } from "#tools/eslint/errors/MissingEslintError";
import { formatInfoMessages, listInfoMessages } from "#tools/eslint/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  tool_input: object({
    file_path: string(),
  }),
});

async function reportInfoMessages(payload: unknown) {
  const {
    cwd,
    tool_input: { file_path: file },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const context = formatInfoMessages(
    file,
    await listInfoMessages(
      await loadValidatedConfig(resolveHookDirectory(cwd), {
        reporter: getRunContext().reporter,
      }),
      file,
    ),
  );

  if (context !== undefined) {
    writeHookContext({
      event: "PostToolUse",
      context,
    });
  }
}

export default async function (): Promise<void> {
  const payload: unknown = JSON.parse(await text(process.stdin));

  try {
    await reportInfoMessages(payload);
  } catch (error) {
    if (error instanceof MissingEslintError) {
      return;
    }

    // @debt Every other failure is swallowed without a diagnostic, so a broken config or ESLint crash goes unnoticed; report it without disturbing the session.
    process.exitCode = 0;
  }
}
