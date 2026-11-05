import { readFileSync } from "node:fs";

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
  return command
    .action(async () => {
      const {
        tool_input: { file_path: file },
      } = validate(
        payloadSchema,
        JSON.parse(readFileSync(0, "utf-8")),
        "Claude Code hook payload",
      );

      const config = await loadConfig();

      await formatEditedFile(config, file, formatWithPrettier);

      reportBudgetFindings(
        measureEditedFile(config.root, file, config.agents.budgets),
        {
          mode: config.agents.budgets.mode,
          event: "PostToolUse",
        },
      );
    });
});
