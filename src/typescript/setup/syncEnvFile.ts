import { isNotEmpty, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { identifierPattern, typescriptBlocks } from "#typescript/constants";
import { inferType } from "#typescript/utils/inferType";
import { syncBlocks } from "#utils/syncBlocks";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ResolvedGlobal } from "#config/types/ResolvedGlobal";

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

  const body = map(lines, (line) => {
    return ` * ${line}`.trimEnd();
  });

  return `/**\n${body.join("\n")}\n */\n`;
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

export function syncEnvFile(config: ResolvedConfig) {
  const { types, values } = config.define;

  if (!types) {
    return;
  }

  const file = relativeWithin(config.root, config.typescript.envFile);

  const declared = entries(values).filter(([name]) => {
    return identifierPattern.test(name);
  });

  const current = config.filesystem.read(file) ?? "";

  const hasBlock = markerLine.test(current);

  if (!hasBlock && !isNotEmpty(declared)) {
    return;
  }

  const content = hasBlock ? current : appendBlock(current);

  const declarations = map(declared, renderDeclaration).join("\n\n");

  config.filesystem.write(
    file,
    syncBlocks(content, typescriptBlocks, {
      [directive](...args) {
        if (isNotEmpty(args)) {
          throw new Error(`"${marker}" takes no arguments in ${file}`);
        }

        return declarations;
      },
    }),
  );
}
