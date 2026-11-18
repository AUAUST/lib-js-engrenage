import { iterable } from "@auaust/toolkit";
import { isNonEmptyArray } from "@auaust/toolkit/array";
import { entries } from "@auaust/toolkit/object";

import { identifierPattern } from "#tools/typescript/constants";
import { inferType } from "#tools/typescript/utils/inferType";
import type { DirectiveFill, ResolvedGlobal } from "#project/config/index";

function renderDescription(description: string | undefined): string {
  if (description === undefined) {
    return "";
  }

  const lines = description.trim().split("\n");

  if (lines.length === 1) {
    return `/** ${lines.join("")} */\n`;
  }

  const body = iterable.map(lines, (line) => {
    return ` * ${line}`.trimEnd();
  });

  return `/**\n${iterable.join(body, "\n")}\n */\n`;
}

function renderDeclaration([name, { value, exact, type, description }]: [
  string,
  ResolvedGlobal,
]): string {
  const declaration = `declare const ${name}: ${type ?? inferType(value, exact)};`;

  return `${renderDescription(description)}${declaration}`;
}

/**
 * Fills the `@define` block with a declaration of each defined global named
 * by a valid identifier.
 *
 * @throws {Error} The marker has arguments.
 */
export const fillDefineBlock: DirectiveFill = async ({
  args,
  file,
  config,
}) => {
  if (isNonEmptyArray(args)) {
    throw new Error(`"@define" takes no arguments in ${file}`);
  }

  const { values } = await config.resolve("define");

  const declared = entries(values).filter(([name]) => {
    return identifierPattern.test(name);
  });

  return iterable.join(iterable.map(declared, renderDeclaration), "\n\n");
};
