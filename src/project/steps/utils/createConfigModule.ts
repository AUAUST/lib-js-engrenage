import { map } from "@auaust/primitive-kit/arrays";

interface NamedImports {
  names: readonly string[];
  entry: string;
}

function renderImport({ names, entry }: NamedImports): string {
  const list = names.length === 1
    ? ` ${names.join("")} `
    : `\n${map(names, (name) => `  ${name},\n`).join("")}`;

  return `import {${list}} from "${entry}";\n`;
}

export function createConfigModule({
  entry,
  definer,
  options,
  imports = [],
  declarations = [],
}: {
  entry: string;
  definer: string;
  options?: string;
  imports?: readonly NamedImports[];
  declarations?: readonly string[];
}): string {
  const statements = map(
    [{ names: [definer], entry }, ...imports],
    renderImport,
  );

  const body = map(declarations, (declaration) => `\n${declaration}\n`);

  return `${statements.join("")}${body.join("")}\nexport default ${definer}(${options || ""});\n`;
}
