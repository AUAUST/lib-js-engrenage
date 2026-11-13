import type { TsdownPlugin } from "tsdown";

import { trimInternalTags } from "#tools/tsdown/utils/trimInternalTags";

const declarationChunk = /\.d\.[cm]?ts$/;

export function createInternalTagsPlugins(
  name: string,
  tags: readonly string[],
): TsdownPlugin[] {
  const internal = new Set(tags);

  return [
    {
      name,
      renderChunk(code, { fileName }) {
        if (!declarationChunk.test(fileName)) {
          return null;
        }

        return trimInternalTags(code, internal) ?? null;
      },
    },
  ];
}
