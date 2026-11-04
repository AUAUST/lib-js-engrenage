import { map } from "@auaust/primitive-kit/arrays";
import { getOwn, keys } from "@auaust/toolkit/object";

import { syncFiles } from "#blocks/operations/syncFiles";
import { syncBlocks } from "#blocks/utils/syncBlocks";
import { relativeWithin } from "#filesystem/utils/relativeWithin";
// @debt reaches into project/config, a higher layer than foundation; the layered registry (#143) removes the upward dependency
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { GlobGroup } from "#types/GlobGroup";
import type { IgnorePresets } from "#types/IgnorePresets";

function renderGroup({ title, globs }: GlobGroup): string {
  return [`# ${title}`, ...globs].join("\n");
}

export function syncIgnoreFile(
  config: ResolvedConfig,
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

  syncFiles(config, [
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
