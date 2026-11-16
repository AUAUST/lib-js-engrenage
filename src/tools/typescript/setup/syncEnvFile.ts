import { isNonEmptyArray } from "@auaust/toolkit/array";
import { join, map as mapIterable } from "@auaust/toolkit/iterable";
import { entries } from "@auaust/toolkit/object";

import { syncBlocks } from "#foundation/blocks/index";
import { relativeWithin } from "#foundation/filesystem/index";
import {
  identifierPattern,
  typescriptBlocks,
} from "#tools/typescript/constants";
import { inferType } from "#tools/typescript/utils/inferType";
import type { LoadedConfig, ResolvedGlobal } from "#project/config/index";

const directive = "define";

const marker = `${typescriptBlocks.open}@${directive}${typescriptBlocks.close}`;

const markerLine = new RegExp(`^${RegExp.escape(marker)}$`, "m");

function renderDescription(description: string | undefined): string {
  if (description === undefined) {
    return "";
  }

  const lines = description.trim().split("\n");

  if (lines.length === 1) {
    return `/** ${lines.join("")} */\n`;
  }

  const body = mapIterable(lines, (line) => {
    return ` * ${line}`.trimEnd();
  });

  return `/**\n${join(body, "\n")}\n */\n`;
}

function renderDeclaration([name, { value, exact, type, description }]: [
  string,
  ResolvedGlobal,
]): string {
  const declaration = `declare const ${name}: ${type ?? inferType(value, exact)};`;

  return `${renderDescription(description)}${declaration}`;
}

function appendBlock(content: string): string {
  const block = `${marker}\n${typescriptBlocks.open}@end${typescriptBlocks.close}\n`;

  return content.trim() === "" ? block : `${content.trimEnd()}\n\n${block}`;
}

/**
 * Fills the `@define` block of the TypeScript env file with a declaration of each
 * defined global named by a valid identifier, appending the block when absent.
 * Does nothing when defined globals are not typed, or when the file has no block
 * and no global to declare; throws when the block's marker has arguments.
 */
export async function syncEnvFile(config: LoadedConfig) {
  const { types, values } = await config.resolve("define");

  if (!types) {
    return;
  }

  const typescript = await config.resolve("typescript");

  const file = relativeWithin(config.context.root, typescript.envFile);

  const filesystem = config.context.filesystem;

  const declared = entries(values).filter(([name]) => {
    return identifierPattern.test(name);
  });

  const current = (await filesystem.read(file)) ?? "";

  const hasBlock = markerLine.test(current);

  if (!hasBlock && !isNonEmptyArray(declared)) {
    return;
  }

  const content = hasBlock ? current : appendBlock(current);

  const declarations = join(mapIterable(declared, renderDeclaration), "\n\n");

  await filesystem.write(
    file,
    await syncBlocks(content, typescriptBlocks, {
      [directive](...args) {
        if (isNonEmptyArray(args)) {
          throw new Error(`"${marker}" takes no arguments in ${file}`);
        }

        return declarations;
      },
    }),
  );
}
