import { join } from "@auaust/primitive-kit/arrays";

import { defineReplacement } from "#eslint/conventions/defineReplacement";
import type { Presets } from "#config/types/Presets";
import type { Convention } from "#eslint/types/Convention";
import type { PackageNames } from "#types/PackageNames";

function createSelector(
  name: string,
  properties: readonly string[] | undefined,
): string {
  function identifier(path: string): string {
    return `[${path}.type='Identifier'][${path}.name='${name}']`;
  }

  const pattern =
    properties === undefined ? undefined : `/^(${join(properties, "|")})$/`;

  const accessed =
    pattern === undefined
      ? ""
      : `:matches([computed=false][property.name=${pattern}], [computed=true][property.value=${pattern}])`;

  const destructured =
    pattern === undefined ? "" : ` > Property[key.name=${pattern}]`;

  return [
    `MemberExpression${identifier("object")}${accessed}`,
    `VariableDeclarator${identifier("init")} > ObjectPattern${destructured}`,
    `AssignmentExpression${identifier("right")} > ObjectPattern${destructured}`,
  ].join(", ");
}

function createTarget(
  name: string,
  properties: readonly string[] | undefined,
): string {
  const [property, ...others] = properties ?? [];

  return property === undefined || others.length > 0
    ? `\`${name}.*\``
    : `\`${name}.${property}\``;
}

export function defineGlobalReplacement({
  global,
  properties,
  replacement,
  enabled,
  presets,
  requires,
}: {
  global: string;
  properties?: readonly string[];
  replacement: string;
  enabled?: boolean;
  presets?: Presets;
  requires?: PackageNames;
}): Convention {
  return defineReplacement({
    selector: createSelector(global, properties),
    target: createTarget(global, properties),
    replacement,
    enabled,
    presets,
    requires,
  });
}
