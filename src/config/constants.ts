import { freeze } from "@auaust/toolkit/object";

import type { Presets } from "#config/types/Presets";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const coverageDirectory = "coverage" satisfies Directory;

export const configFileName = "engrenage.config" satisfies File;

export const defaultCodeFiles = "**/*.{ts,tsx}" satisfies Glob;

export const defaultConfigFiles = freeze([
  "*.config.ts",
  ".*.ts",
] as const) satisfies Globs;

export const defaultDiscoveredFiles = freeze([] as const) satisfies Globs;

export const defaultDistTsconfigFile = "tsconfig.dist.json" satisfies File;

export const defaultFixtureFiles = "**/fixtures/**" satisfies Glob;

export const defaultGeneratedFiles = freeze([] as const) satisfies Globs;

export const defaultGitignoreFile = ".gitignore" satisfies File;

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
] as const) satisfies Globs;

export const defaultPresets = freeze([] as const) satisfies Presets;

export const defaultPrettierignoreFile = ".prettierignore" satisfies File;

export const defaultSourceDirectories = freeze([
  "src",
] as const) satisfies Directories;

export const defaultTestDirectories = freeze([
  "tests",
] as const) satisfies Directories;

export const defaultTestFiles = "**/*.{test,spec}.{ts,tsx}" satisfies Glob;

export const defaultTsconfigFile = "tsconfig.json" satisfies File;

export const packageFile = "package.json" satisfies File;

export const presets = freeze(["library"] as const) satisfies Globs;
