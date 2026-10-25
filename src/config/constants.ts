import { freeze } from "@auaust/toolkit/object";

import type { Directories } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob, Globs } from "#types/Glob";

export const builtinGeneratedFiles: Globs = freeze([
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "coverage/**",
]);

export const configFileName = "engrenage.config";

export const defaultCodeFiles: Glob = "**/*.{ts,tsx}";

export const defaultConfigFiles: Globs = freeze(["*.config.ts", ".*.ts"]);

export const defaultFixtureFiles: Glob = "**/fixtures/**";

export const defaultGitignoreFile: File = ".gitignore";

export const defaultInstructionFiles: Globs = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
]);

export const defaultSourceDirectories: Directories = freeze(["src"]);

export const defaultTestDirectories: Directories = freeze(["tests"]);

export const defaultTestFiles: Glob = "**/*.{test,spec}.{ts,tsx}";

export const defaultTsconfigFile: File = "tsconfig.json";

export const packageFile: File = "package.json";
