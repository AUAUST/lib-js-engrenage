import { entries } from "@auaust/toolkit/object";

import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { PathAliases } from "#typescript/types/PathAliases";

function toSubpathPattern(subpath: string): RegExp {
  const escaped = subpath.replaceAll(/[$()+.?[\\\]^{|}]/g, String.raw`\$&`);

  return new RegExp(`^${escaped.replace("*", ".+")}$`);
}

function toSubpath({ name }: { name: string }): string {
  if (name === "index") {
    return ".";
  }

  return `./${name.endsWith("/index") ? name.slice(0, -"/index".length) : name}`;
}

export function resolveDataExports(
  { data }: ResolvedConfig,
  sourceEntries: PathAliases,
): Record<string, string> {
  const dataExports: Record<string, string> = {};

  const sourceSubpaths = new Map(
    sourceEntries.map((entry) => {
      return [toSubpath(entry), entry.path];
    }),
  );

  for (const [subpath, target] of entries(data.exports)) {
    const pattern = toSubpathPattern(subpath);

    for (const [sourceSubpath, sourcePath] of sourceSubpaths) {
      if (pattern.test(sourceSubpath)) {
        throw new Error(
          `Subpath '${sourceSubpath}' is exposed by both src (${sourcePath}) and data.exports ('${subpath}': ${target})`,
        );
      }
    }

    dataExports[subpath] = target.startsWith("./") ? target : `./${target}`;
  }

  return dataExports;
}
