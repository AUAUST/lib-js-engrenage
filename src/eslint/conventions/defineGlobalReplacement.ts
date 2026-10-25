import { defineReplacement } from "#eslint/conventions/defineReplacement";
import type { Convention } from "#eslint/types/Convention";

function createSelector(name: string, property: string | undefined): string {
  function identifier(path: string): string {
    return `[${path}.type='Identifier'][${path}.name='${name}']`;
  }

  const accessed =
    property === undefined
      ? ""
      : `:matches([computed=false][property.name='${property}'], [computed=true][property.value='${property}'])`;

  const destructured =
    property === undefined ? "" : ` > Property[key.name='${property}']`;

  return [
    `MemberExpression${identifier("object")}${accessed}`,
    `VariableDeclarator${identifier("init")} > ObjectPattern${destructured}`,
    `AssignmentExpression${identifier("right")} > ObjectPattern${destructured}`,
  ].join(", ");
}

export function defineGlobalReplacement({
  global,
  replacement,
  enabled,
}: {
  global: string;
  replacement: string;
  enabled?: boolean;
}): Convention {
  const [name = global, property] = global.split(".");

  return defineReplacement({
    selector: createSelector(name, property),
    target: property === undefined ? `\`${name}.*\`` : `\`${global}\``,
    replacement,
    enabled,
  });
}
