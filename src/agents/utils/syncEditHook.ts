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
  { file, matcher, command }: { file: File; matcher: string; command: string },
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

  const found = entries.some((group) => {
    return group.hooks?.some((hook) => hook.command === command);
  });

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
