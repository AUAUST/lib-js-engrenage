import type { Glob } from "#types/Glob";

export const builtinGeneratedFiles: Glob[] = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "coverage/**",
];
