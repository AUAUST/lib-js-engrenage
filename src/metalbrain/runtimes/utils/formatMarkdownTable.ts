export function formatMarkdownTable(
  header: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  return [header, header.map(() => "---"), ...rows]
    .map((cells) => `| ${cells.join(" | ")} |`)
    .join("\n");
}
