import { map } from "@auaust/primitive-kit/arrays";
import { getOwn, keys } from "@auaust/toolkit/object";

import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { GlobGroup } from "#types/GlobGroup";
import type { IgnorePresets } from "#types/IgnorePresets";
import type { SyncResults } from "#types/SyncResults";

function renderGroup({ title, globs }: GlobGroup): string {
  return [`# ${title}`, ...globs].join("\n");
}

export function syncIgnoreFile({
  root,
  path,
  presets,
  check,
}: {
  root: Directory;
  path: File | undefined;
  presets: IgnorePresets;
  check: boolean;
}): SyncResults {
  if (path === undefined) {
    return [];
  }

  const file = relativeWithin(root, path);

  function ignore(...names: string[]): string {
    const marker = `# @ignore ${names.join(" ")}`;

    const [name, ...others] = names;

    if (name === undefined || others.length > 0) {
      throw new Error(`Expected a single preset in "${marker}" of ${file}`);
    }

    const preset = getOwn(presets, name);

    if (preset === undefined) {
      throw new Error(
        `Unknown preset in "${marker}" of ${file}, expected one of: ${keys(presets).join(", ")}`,
      );
    }

    return map(preset(), renderGroup).join("\n\n");
  }

  return syncFiles({
    root,
    files: [
      {
        file,
        update(content) {
          return syncBlocks(
            content,
            {
              open: "# ",
              close: "",
              padding: "\n\n",
            },
            {
              ignore,
            },
          );
        },
      },
    ],
    check,
  });
}
