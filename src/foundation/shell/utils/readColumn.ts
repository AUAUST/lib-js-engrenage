export function readColumn(source: string, index: number) {
  const before = source.slice(0, index);

  return before.length - before.lastIndexOf("\n");
}
