import { fileURLToPath } from "node:url";

import { buildMode } from "@auaust/engrenage/vitest/constants";

import manifest from "#package.json" with { type: "json" };

export function getExecutable(): string {
  const path =
    process.env.MODE === buildMode
      ? manifest.bin.engrenage
      : "./bin/engrenage/index.ts";

  return fileURLToPath(new URL(`../../${path}`, import.meta.url));
}
