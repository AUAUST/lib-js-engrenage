import { isNotEmpty, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { syncBlocks } from "#foundation/blocks/index";
import { relativeWithin } from "#foundation/filesystem/index";
import {
  identifierPattern,
  typescriptBlocks,
} from "#tools/typescript/constants";
import { inferType } from "#tools/typescript/utils/inferType";
import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig, ResolvedGlobal } from "#project/config/index";

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

export async function syncEnvFile(config: OptionContext<ProjectConfig>) {
  const { types, values } = await config.get("define");

  if (!types) {
    return;
  }

  const typescript = await config.get("typescript");

  const file = relativeWithin(await config.get("root"), typescript.envFile);

  const filesystem = await config.get("filesystem");

  const declared = entries(values).filter(([name]) => {
    return identifierPattern.test(name);
  });

  const current = (await filesystem.read(file)) ?? "";

  const hasBlock = markerLine.test(current);

  if (!hasBlock && !isNotEmpty(declared)) {
    return;
  }

  const content = hasBlock ? current : appendBlock(current);

  const declarations = map(declared, renderDeclaration).join("\n\n");

  await filesystem.write(
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
