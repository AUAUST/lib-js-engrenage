import { freeze } from "@auaust/toolkit/object";

import type { Presets } from "#config/types/Presets";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const defaultEmptyOutDir = true;

export const defaultCoverageDirectory = "coverage" satisfies Directory;

export const defaultCodeFiles = "**/*.{ts,tsx}" satisfies Glob;

export const defaultConfigFiles = freeze([
  "*.config.ts",
  ".*.ts",
] as const) satisfies Globs;

export const defaultDiscoveredFiles = freeze([] as const) satisfies Globs;

export const defaultFixtureFiles = "**/fixtures/**" satisfies Glob;

export const defaultGeneratedFiles = freeze([] as const) satisfies Globs;

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
] as const) satisfies Globs;

export const defaultPresets = freeze([] as const) satisfies Presets;

export const defaultSourceDirectories = freeze([
  "src",
  "bin",
  "scripts",
] as const) satisfies Directories;

export const defaultTestDirectories = freeze([
  "tests",
] as const) satisfies Directories;

export const defaultTestFiles = "**/*.{test,spec}.{ts,tsx}" satisfies Glob;

export const presets = freeze(["library"] as const) satisfies Globs;
