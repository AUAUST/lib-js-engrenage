export function getStructureLayer(
  name: string,
  layers: readonly string[] | undefined,
) {
  if (layers === undefined) {
    return;
  }

  const index = layers.indexOf(name);
  const fallback = layers.indexOf("*");

  return index === -1 ? (fallback === -1 ? undefined : fallback) : index;
}
