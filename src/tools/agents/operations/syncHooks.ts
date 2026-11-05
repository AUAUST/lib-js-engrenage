import { array, looseObject, optional, record, string } from "valibot";

import { entries as toEntries } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import { readJsonValue, writeJsonValue } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";
import type { File } from "#types/File";

const hooksSchema = optional(
  record(
    string(),
    array(
      looseObject({
        matcher: optional(string()),
        hooks: optional(
          array(
            looseObject({
              command: optional(string()),
              if: optional(string()),
            }),
          ),
        ),
      }),
    ),
  ),
);

export async function syncHooks(
  {
    filesystem,
    resolve,
  }: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  {
    file,
    hooks,
    prefix,
  }: { file: File; hooks: readonly HookDefinition[]; prefix: string },
) {
  const path = resolve(file);

  let content = (await filesystem.read(file)) ?? emptyObjectFile;

  function read() {
    return (
      validate(
        hooksSchema,
        readJsonValue(content, path, ["hooks"]),
        `${file} hooks`,
      ) ?? {}
    );
  }

  function remove(location: (string | number)[]) {
    content = writeJsonValue(
      content,
      path,
      location,
      undefined,
      jsonIndentation,
    );
  }

  function isProduced(
    event: string,
    matcher: string | undefined,
    command: string | undefined,
    condition: string | undefined,
  ) {
    return hooks.some((hook) => {
      return (
        hook.event === event &&
        hook.matcher === matcher &&
        hook.command === command &&
        hook.condition === condition
      );
    });
  }

  for (const [event, groups] of toEntries(read())) {
    for (let group = groups.length - 1; group >= 0; group--) {
      const { matcher, hooks: entries } = groups[group];

      if (entries === undefined) {
        continue;
      }

      const stale = entries
        .map((entry, index) => {
          return { entry, index };
        })
        .filter(({ entry: { command, if: condition } }) => {
          return (
            command?.startsWith(prefix) === true &&
            !isProduced(event, matcher, command, condition)
          );
        });

      if (stale.length === 0) {
        continue;
      }

      if (stale.length === entries.length) {
        remove(["hooks", event, group]);

        continue;
      }

      for (const { index } of stale.reverse()) {
        remove(["hooks", event, group, "hooks", index]);
      }
    }

    if (read()[event]?.length === 0) {
      remove(["hooks", event]);
    }
  }

  const present = read();

  for (const { event, matcher, command, condition } of hooks) {
    const found = present[event]?.some((group) => {
      return (
        group.matcher === matcher &&
        group.hooks?.some((entry) => {
          return entry.command === command && entry.if === condition;
        })
      );
    });

    if (!found) {
      content = writeJsonValue(
        content,
        path,
        ["hooks", event, -1],
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
  }

  await filesystem.write(file, content);
}
