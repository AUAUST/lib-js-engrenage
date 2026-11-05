import { array, looseObject, optional, string } from "valibot";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue, writeJsonValue } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import type { Filesystem } from "#foundation/filesystem/index";
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

export async function syncHook(
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

  let content = (await filesystem.read(file)) ?? emptyObjectFile;

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

  await filesystem.write(file, content);
}
