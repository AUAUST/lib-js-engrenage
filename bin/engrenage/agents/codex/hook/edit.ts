import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { literal, object, string } from "valibot";

import { validate } from "#foundation/options/utils/validate";
import { getPatchedFiles } from "#tools/agents/codex/utils/getPatchedFiles";
import { formatEditedFile } from "#tools/agents/operations/formatEditedFile";
import { measureEditedFile } from "#tools/agents/operations/measureEditedFile";
import { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
import { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const payloadSchema = object({
  cwd: string(),
  tool_name: literal("apply_patch"),
  tool_input: object({
    command: string(),
  }),
});

export const edit = defineCommand((command) => {
  return command.action(async () => {
    const {
      cwd,
      tool_input: { command: patch },
    } = validate(
      payloadSchema,
      JSON.parse(readFileSync(0, "utf-8")),
      "Codex hook payload",
    );

    const config = await loadConfig(cwd);

    for (const path of getPatchedFiles(patch)) {
      const file = resolve(cwd, path);

      if (!existsSync(file)) {
        continue;
      }

      // @debt formatWithPrettier called in a loop means every file re-instantiates the formatter
      await formatEditedFile(config, file, formatWithPrettier);

      const agents = await config.get("agents");

      reportBudgetFindings(
        measureEditedFile(await config.get("root"), file, agents.budgets),
        {
          mode: agents.budgets.mode,
          event: "PostToolUse",
        },
      );
    }
  });
});
