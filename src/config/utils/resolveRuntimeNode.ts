import { engrenage } from "#constants";

import manifest from "#package.json" with { type: "json" };

export function resolveRuntimeNode(configured: number | undefined): number {
  if (configured !== undefined) {
    return configured;
  }

  const major = /\d+/.exec(manifest.engines.node)?.[0];

  if (major === undefined) {
    throw new Error(`${engrenage} declares no engines.node to default to`);
  }

  return Number(major);
}
