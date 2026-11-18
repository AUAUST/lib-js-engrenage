import { isNonEmptyArray } from "@auaust/toolkit/array";
import { keys } from "@auaust/toolkit/object";

import { relativeWithin } from "#foundation/filesystem/index";
import {
  identifierPattern,
  typescriptBlocks,
} from "#tools/typescript/constants";
import type { LoadedConfig } from "#project/config/index";

const marker = `${typescriptBlocks.open}@define${typescriptBlocks.close}`;

const markerLine = new RegExp(`^${RegExp.escape(marker)}$`, "m");

function appendBlock(content: string): string {
  const block = `${marker}\n${typescriptBlocks.open}@end${typescriptBlocks.close}\n`;

  return content.trim() === "" ? block : `${content.trimEnd()}\n\n${block}`;
}

/**
 * Appends an empty `@define` block to the TypeScript env file, creating the
 * file when absent, for the `blocks` target to fill. Does nothing when defined
 * globals are not typed, when the file has the block, or when no global
 * needs a declaration.
 */
export async function syncEnvFile(config: LoadedConfig) {
  const { types, values } = await config.resolve("define");

  if (!types) {
    return;
  }

  const typescript = await config.resolve("typescript");

  const file = relativeWithin(config.context.root, typescript.envFile);

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
