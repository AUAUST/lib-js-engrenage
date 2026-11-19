import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";

export function renderUnreachedNode({
  path,
  kind,
  config,
  files,
}: EnvironmentStructure["unreached"][number]): string {
  const sources = [...(config ? ["the config"] : []), ...files];

  return `${path}  unreached ${kind}, declared by ${sources.join(", ")}`;
}
