import { isString } from "@auaust/toolkit/isString";
import { entries } from "@auaust/toolkit/object";

import type { File } from "#types/File";
import type { SubpathImports } from "#typescript/types/SubpathImports";

function matchSpecifier(
  specifier: string,
  target: string,
  file: File,
): string | null {
  const [targetPrefix = "", targetSuffix, ...rest] = target.split("*");

  if (targetSuffix === undefined) {
    return target === file ? specifier : null;
  }

  const fits =
    rest.length === 0 &&
    file.length >= targetPrefix.length + targetSuffix.length &&
    file.startsWith(targetPrefix) &&
    file.endsWith(targetSuffix);

  if (!fits) {
    return null;
  }

  const captured = file.slice(
    targetPrefix.length,
    file.length - targetSuffix.length,
  );

  return specifier.replace("*", captured);
}

export function resolveImportSpecifier(
  imports: SubpathImports,
  file: File,
): string {
  const relativeFile = file.startsWith("./") ? file : `./${file}`;

  const specifiers: string[] = [];

  for (const [specifier, target] of entries(imports)) {
    if (!isString(target)) {
      continue;
    }

    const match = matchSpecifier(specifier, target, relativeFile);

    if (match !== null) {
      specifiers.push(match);
    }
  }

  const [specifier, ...others] = specifiers;

  if (specifier === undefined || others.length > 0) {
    throw new Error(
      `Expected one subpath import for "${file}", found ${specifiers.length}`,
    );
  }

  return specifier;
}
