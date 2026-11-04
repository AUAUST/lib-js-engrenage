import { array, looseObject, optional, string } from "valibot";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import { validate } from "#foundation/options/utils/validate";
import { jsonIndentation } from "#project/format/constants";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
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
  {
    filesystem,
    resolve,
  }: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  { file, matcher, command }: { file: File; matcher: string; command: string },
) {
  const path = resolve(file);
  const location = ["hooks", "PostToolUse"];

  let content = filesystem.read(file) ?? emptyObjectFile;

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
      jsonIndentation,
      {
        isArrayInsertion: true,
      },
    );
  }

  filesystem.write(file, content);
}
