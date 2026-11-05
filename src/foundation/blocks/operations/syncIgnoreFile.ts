import { map } from "@auaust/primitive-kit/arrays";
import { getOwn, keys } from "@auaust/toolkit/object";

import { syncFiles } from "#foundation/blocks/operations/syncFiles";
import { syncBlocks } from "#foundation/blocks/utils/syncBlocks";
import { relativeWithin, type Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { GlobGroup } from "#types/GlobGroup";
import type { IgnorePresets } from "#types/IgnorePresets";

function renderGroup({ title, globs }: GlobGroup): string {
  return [`# ${title}`, ...globs].join("\n");
}

export async function syncIgnoreFile(
  config: {
    root: Directory;
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  {
    path,
    presets,
  }: {
    path: File | undefined;
    presets: IgnorePresets;
  },
) {
  if (path === undefined) {
    return;
  }

  const file = relativeWithin(config.root, path);

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

  await syncFiles(config, [
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
  ]);
}
