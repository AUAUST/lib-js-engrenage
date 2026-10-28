import { readFileSync } from "node:fs";

import { object, string } from "valibot";

import { formatEditedFile } from "#agents/utils/formatEditedFile";
import { loadConfig } from "#config/utils/loadConfig";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { validate } from "#utils/validate";

const payloadSchema = object({
  tool_input: object({
    file_path: string(),
  }),
});

export const edit = defineCommand((command) => {
  return command
    .description(
      "Fix, format and lint the file Claude edited, reading its PostToolUse payload from stdin.",
    )
    .action(async () => {
      const {
        tool_input: { file_path: file },
      } = validate(
        payloadSchema,
        JSON.parse(readFileSync(0, "utf-8")),
        "Claude Code hook payload",
      );

      formatEditedFile(await loadConfig(), file);
    });
});
