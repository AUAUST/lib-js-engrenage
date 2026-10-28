import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { literal, object, string } from "valibot";

import { getPatchedFiles } from "#agents/codex/utils/getPatchedFiles";
import { formatEditedFile } from "#agents/utils/formatEditedFile";
import { loadConfig } from "#config/utils/loadConfig";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { validate } from "#utils/validate";

const payloadSchema = object({
  cwd: string(),
  tool_name: literal("apply_patch"),
  tool_input: object({
    command: string(),
  }),
});

export const edit = defineCommand((command) => {
  return command
    .description(
      "Fix, format and lint the files Codex patched, reading its PostToolUse payload from stdin.",
    )
    .action(async () => {
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

        if (existsSync(file)) {
          formatEditedFile(config, file);
        }
      }
    });
});
