import { freeze } from "@auaust/toolkit/object";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

export const builtinGeneratedFiles: readonly Glob[] = freeze([
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "coverage/**",
]);

export const configFileName = "engrenage.config";

export const defaultCodeFiles: Glob = "**/*.{ts,tsx}";

export const defaultConfigFiles: readonly Glob[] = freeze([
  "*.config.ts",
  ".*.ts",
]);

export const defaultDiscoveredFiles: readonly Glob[] = freeze([]);

export const defaultDistTsconfigFile: File = "tsconfig.dist.json";

export const defaultFixtureFiles: Glob = "**/fixtures/**";

export const defaultGitignoreFile: File = ".gitignore";

export const defaultInstructionFiles: readonly Glob[] = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
]);

export const defaultSourceDirectories: readonly Directory[] = freeze(["src"]);

export const defaultTestDirectories: readonly Directory[] = freeze(["tests"]);

export const defaultTestFiles: Glob = "**/*.{test,spec}.{ts,tsx}";

export const defaultTsconfigFile: File = "tsconfig.json";

export const packageFile: File = "package.json";
