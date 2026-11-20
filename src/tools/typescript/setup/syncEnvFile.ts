import { isNonEmptyArray } from "@auaust/toolkit/array";
import { keys } from "@auaust/toolkit/object";

import { formatBlockMarker } from "#foundation/blocks/index";
import {
  identifierPattern,
  typescriptBlocks,
} from "#tools/typescript/constants";
import { resolveSourceDeclarationsFile } from "#tools/typescript/operations/resolveSourceDeclarationsFile";
import type { LoadedConfig } from "#project/config/index";

const marker = formatBlockMarker(typescriptBlocks, "define");

const markerLine = new RegExp(`^${RegExp.escape(marker)}$`, "m");

function appendBlock(content: string): string {
  const block = `${marker}\n${formatBlockMarker(typescriptBlocks, "end")}\n`;

  return content.trim() === "" ? block : `${content.trimEnd()}\n\n${block}`;
}

/**
 * Appends an empty `@define` block to the `src` declarations file, creating the
 * file when absent, for the `blocks` target to fill. Does nothing when defined
 * globals are not typed, when `src` has no directory, when the file has the
 * block, or when no global needs a declaration.
 */
export async function syncEnvFile(config: LoadedConfig) {
  const { types, values } = await config.resolve("define");

  if (!types) {
    return;
  }

  const file = await resolveSourceDeclarationsFile(config);

  if (file === undefined) {
    return;
  }

  const filesystem = config.context.filesystem;

  const current = (await filesystem.read(file)) ?? "";

  if (markerLine.test(current)) {
    return;
  }

  const declared = keys(values).filter((name) => {
    return identifierPattern.test(name);
  });

  if (!isNonEmptyArray(declared)) {
    return;
  }

  await filesystem.write(file, appendBlock(current));
}
