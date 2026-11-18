import { join, map } from "@auaust/toolkit/iterable";

interface NamedImports {
  names: readonly string[];
  entry: string;
}

function renderImport({ names, entry }: NamedImports): string {
  const list = names.length === 1
    ? ` ${names.join("")} `
    : `\n${join(
        map(names, (name) => `  ${name},\n`),
        "",
      )}`;

  return `import {${list}} from "${entry}";\n`;
}

export function createConfigModule({
  entry,
  definer,
  options,
  rooted = false,
  imports = [],
  declarations = [],
}: {
  entry: string;
  definer: string;
  options?: string;
  rooted?: boolean;
  imports?: readonly NamedImports[];
  declarations?: readonly string[];
}): string {
  const statements = map(
    [{ names: [definer], entry }, ...imports],
    renderImport,
  );

  const body = map(declarations, (declaration) => `\n${declaration}\n`);

  const call = rooted ? `${definer}.at(import.meta.url)` : definer;

  return `${join(statements, "")}${join(body, "")}\nexport default ${call}(${options || ""});\n`;
}
