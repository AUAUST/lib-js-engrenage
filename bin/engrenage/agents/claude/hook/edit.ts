import { text } from "node:stream/consumers";

import { object, string } from "valibot";

import { validate } from "#foundation/options/utils/validate";
import { formatEditedFile } from "#tools/agents/operations/formatEditedFile";
import { measureEditedFile } from "#tools/agents/operations/measureEditedFile";
import { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
import { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const payloadSchema = object({
  tool_input: object({
    file_path: string(),
  }),
});

export const edit = defineCommand((command) => {
  return command.action(async () => {
    const {
      tool_input: { file_path: file },
    } = validate(
      payloadSchema,
      JSON.parse(await text(process.stdin)),
      "Claude Code hook payload",
    );

    const config = await loadConfig();

    await formatEditedFile(config, file, formatWithPrettier);

    const agents = await config.get("agents");

    reportBudgetFindings(
      await measureEditedFile(await config.get("root"), file, agents.budgets),
      {
        mode: agents.budgets.mode,
        event: "PostToolUse",
      },
    );
  });
});
