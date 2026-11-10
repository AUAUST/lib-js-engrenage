import { max } from "@auaust/toolkit/math";
import { entries } from "@auaust/toolkit/object";

import { resolveImportTarget } from "#tools/typescript/utils/resolveImportTarget";
import type { SubpathImports } from "#project/package/index";
import type { File } from "#types/File";

interface Match {
  readonly specifier: string;
  readonly specificity: number;
}

function matchSpecifier(
  specifier: string,
  target: string,
  file: File,
): Match | null {
  const [targetPrefix = "", targetSuffix, ...rest] = target.split("*");

  if (targetSuffix === undefined) {
    return target === file ? { specifier, specificity: Infinity } : null;
  }

  if (rest.length > 0) {
    throw new Error(
      `Subpath import "${specifier}" has several "*" in its target "${target}"`,
    );
  }

  const fits = (
    file.length >= targetPrefix.length + targetSuffix.length &&
    file.startsWith(targetPrefix) &&
    file.endsWith(targetSuffix)
  );

  if (!fits) {
    return null;
  }

  const captured = file.slice(
    targetPrefix.length,
    file.length - targetSuffix.length,
  );

  return {
    specifier: specifier.replace("*", () => captured),
    specificity: targetPrefix.length,
  };
}

export function resolveImportSpecifier(
  imports: SubpathImports,
  file: File,
): string {
  const relativeFile = file.startsWith("./") ? file : `./${file}`;

  const matches: Match[] = [];

  for (const [specifier, conditions] of entries(imports)) {
    const target = resolveImportTarget(conditions);

    if (target === undefined) {
      continue;
    }

    const match = matchSpecifier(specifier, target, relativeFile);

    if (match !== null) {
      matches.push(match);
    }
  }

  const best = max(...matches.map(({ specificity }) => specificity));

  const [first, ...others] = matches.filter(({ specificity }) => {
    return specificity === best;
  });

  if (first === undefined || others.length > 0) {
    throw new Error(
      `Expected one subpath import for "${file}", found ${matches.length}`,
    );
  }

  return first.specifier;
}
