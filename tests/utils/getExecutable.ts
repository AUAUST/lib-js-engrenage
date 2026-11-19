import { fileURLToPath } from "node:url";

import { buildMode } from "@auaust/engrenage/vitest/constants";

import manifest from "#package.json" with { type: "json" };

export function getExecutable(
  program: keyof typeof manifest.bin = "engrenage",
): string {
  const path = process.env.MODE === buildMode
    ? manifest.bin[program]
    : `./bin/${program}/executable.ts`;

  return fileURLToPath(new URL(`../../${path}`, import.meta.url));
}
