import {
  array,
  boolean,
  looseObject,
  optional,
  picklist,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { unmanagedTsconfig } from "#project/tsconfig/constants";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const defaultSourceDirectories = freeze([
  "src",
] as const) satisfies Directories;

export const defaultDataDirectories = freeze([
  "data",
] as const) satisfies Directories;

export const defaultTestsDirectories = freeze([
  "tests",
] as const) satisfies Directories;

export const defaultBinDirectories = freeze([
  "bin",
] as const) satisfies Directories;

export const defaultScriptsDirectories = freeze([
  "scripts",
] as const) satisfies Directories;

export const defaultToolingDirectories = freeze([
  ".",
  "tooling",
] as const) satisfies Directories;

export const defaultToolingFiles = freeze([
  "*.config.ts",
  ".*.ts",
] as const) satisfies Globs;

export const defaultTestsLocation = "**/*" satisfies Glob;

export const defaultTestsSuffix = ".{spec,test}" satisfies Glob;

export const defaultTestsExtension = ".{ts,tsx}" satisfies Glob;

export const defaultTestsFixtures = freeze([
  "**/fixtures/**",
] as const) satisfies Globs;

export const defaultTestsCoverageDirectory = "coverage" satisfies Directory;

export const disabledCodeEnvironment = freeze({
  dirs: [],
  generated: [],
  discovered: [],
  defines: false,
  tsconfig: unmanagedTsconfig,
} as const);

export const sourceTestsVariant = ".src";

export const distTestsVariant = ".dist";

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const environmentEntry: StandardSchemaV1 = looseObject({
  name: string(),
  title: string(),
  level: picklist(["foreign", "described", "enforced"]),
  structure: optional(picklist(["domains", "roles"])),
  consumesSource: optional(boolean()),
  imports: optional(array(string())),
  tsconfig: optional(boolean()),
  owns: optional(array(string())),
});
