export function createConfigModule({
  entry,
  definer,
  options,
}: {
  entry: string;
  definer: string;
  options?: string;
}): string {
  return `import { ${definer} } from "${entry}";\n\nexport default ${definer}(${options || ""});\n`;
}
