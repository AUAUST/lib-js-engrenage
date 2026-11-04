import { map } from "@auaust/primitive-kit/arrays";

interface NamedImport {
  name: string;
  entry: string;
}

export function createConfigModule({
  entry,
  definer,
  options,
  imports = [],
}: {
  entry: string;
  definer: string;
  options?: string;
  imports?: readonly NamedImport[];
}): string {
  const statements = map(
    [
      {
        name: definer,
        entry,
      },
      ...imports,
    ],
    (named) => `import { ${named.name} } from "${named.entry}";\n`,
  );

  return `${statements.join("")}\nexport default ${definer}(${options || ""});\n`;
}
