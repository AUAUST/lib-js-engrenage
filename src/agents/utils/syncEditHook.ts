import { array, looseObject, optional, string } from "valibot";

import { emptyObjectFile } from "#support/json/constants";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

const hooksSchema = optional(
  array(
    looseObject({
      hooks: optional(
        array(
          looseObject({
            command: optional(string()),
          }),
        ),
      ),
    }),
  ),
);

export function syncEditHook(
  config: ResolvedConfig,
  {
    file,
    matcher,
    command,
    legacyCommand,
  }: { file: File; matcher: string; command: string; legacyCommand?: string },
) {
  const path = config.resolve(file);
  const location = ["hooks", "PostToolUse"];
  let content = config.filesystem.read(file) ?? emptyObjectFile;

  const entries =
    validate(
      hooksSchema,
      readJsonValue(content, path, location),
      `${file} PostToolUse hooks`,
    ) ?? [];

  let found = false;

  for (const [groupIndex, group] of entries.entries()) {
    for (const [hookIndex, hook] of (group.hooks ?? []).entries()) {
      if (hook.command === command) {
        found = true;
      }

      if (legacyCommand === undefined || hook.command !== legacyCommand) {
        continue;
      }

      content = writeJsonValue(
        content,
        path,
        [...location, groupIndex, "hooks", hookIndex, "command"],
        command,
      );

      found = true;
    }
  }

  if (!found) {
    content = writeJsonValue(
      content,
      path,
      [...location, -1],
      {
        matcher,
        hooks: [
          {
            type: "command",
            command,
          },
        ],
      },
      {
        isArrayInsertion: true,
      },
    );
  }

  config.filesystem.write(file, content);
}
