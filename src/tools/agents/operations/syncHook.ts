import { array, looseObject, optional, string } from "valibot";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import { validate } from "#foundation/options/utils/validate";
import { jsonIndentation } from "#project/format/constants";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";
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

export function syncHook(
  {
    filesystem,
    resolve,
  }: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  { file, hook }: { file: File; hook: HookDefinition },
) {
  const path = resolve(file);
  const { event, matcher, command, condition } = hook;
  const location = ["hooks", event];

  let content = filesystem.read(file) ?? emptyObjectFile;

  const entries =
    validate(
      hooksSchema,
      readJsonValue(content, path, location),
      `${file} ${event} hooks`,
    ) ?? [];

  const found = entries.some((group) => {
    return group.hooks?.some((entry) => entry.command === command);
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
            ...(condition === undefined ? {} : { if: condition }),
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
