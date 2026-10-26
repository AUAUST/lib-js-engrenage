import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { defineReplacement } from "#eslint/conventions/defineReplacement";
import type { Presets } from "#config/types/Presets";
import type { Convention } from "#eslint/types/Convention";
import type { ScopeReference } from "#eslint/types/ScopeReference";

function createImportSelectors(source: string, name: string): string[] {
  const imported = `ImportDeclaration[source.value='${source}']`;

  switch (name) {
    case "*":
      return [
        `${imported} > ImportNamespaceSpecifier`,
        `ExportAllDeclaration[source.value='${source}'][exported]`,
      ];
    case "default":
      return [
        `${imported} > ImportDefaultSpecifier`,
        `${imported} > ImportSpecifier[imported.name='default']`,
      ];
    default:
      return [
        `${imported} > ImportSpecifier[imported.name='${name}']`,
        `ExportNamedDeclaration[source.value='${source}'] > ExportSpecifier[local.name='${name}']`,
      ];
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
    case "*":
      return "namespace imports";
    case "default":
      return "default imports";
    default:
      return `\`${name}\``;
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

export function defineImportReplacement({
  source,
  imports,
  replacement,
  files,
  ignores,
  enabled,
  presets,
}: {
  source: string;
  imports?: readonly string[];
  replacement: string;
  files?: readonly ScopeReference[];
  ignores?: readonly ScopeReference[];
  enabled?: boolean;
  presets?: Presets;
}): Convention {
  return defineReplacement({
    selector: createSelector(source, imports),
    target: createTarget(source, imports),
    replacement,
    files,
    ignores,
    enabled,
    presets,
  });
}
