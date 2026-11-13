import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { defineReplacement } from "#tools/eslint/utils/defineReplacement";
import type { Trait } from "#project/presets/index";
import type { Convention } from "#tools/eslint/ports/Convention";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

function createImportSelectors(source: string, name: string): string[] {
  const imported = `ImportDeclaration[source.value='${source}']`;

  switch (name) {
    case "*": {
      return [
        `${imported} > ImportNamespaceSpecifier`,
        `ExportAllDeclaration[source.value='${source}'][exported]`,
      ];
    }

    case "default": {
      return [
        `${imported} > ImportDefaultSpecifier`,
        `${imported} > ImportSpecifier[imported.name='default']`,
      ];
    }

    default: {
      return [
        `${imported} > ImportSpecifier[imported.name='${name}']`,
        `ExportNamedDeclaration[source.value='${source}'] > ExportSpecifier[local.name='${name}']`,
      ];
    }
  }
}

function createSelector(
  source: string,
  imports: readonly string[] | undefined,
): string {
  if (imports === undefined) {
    return map(
      [
        "ImportDeclaration",
        "ExportNamedDeclaration",
        "ExportAllDeclaration",
        "ImportExpression",
      ],
      (node) => {
        return `${node}[source.value='${source}']`;
      },
    ).join(", ");
  }

  return flatMap(imports, (name) => {
    return createImportSelectors(source, name);
  }).join(", ");
}

function describeImport(name: string): string {
  switch (name) {
    case "*": {
      return "namespace imports";
    }

    case "default": {
      return "default imports";
    }

    default: {
      return `\`${name}\``;
    }
  }
}

function createTarget(
  source: string,
  imports: readonly string[] | undefined,
): string {
  if (imports === undefined) {
    return `\`${source}\``;
  }

  const importList = new Intl.ListFormat("en", {
    type: "disjunction",
  });

  return `${importList.format(map(imports, describeImport))} from \`${source}\``;
}

/**
 * @experimental
 */
export function defineImportReplacement({
  source,
  imports,
  ...forward
}: {
  source: string;
  imports?: readonly string[];
  replacement: string;
  files?: ScopeReferences;
  ignores?: ScopeReferences;
  enabled?: boolean;
  traits?: readonly Trait[];
  requires?: PackageNames;
}): Convention {
  return defineReplacement({
    selector: createSelector(source, imports),
    target: createTarget(source, imports),
    ...forward,
  });
}
