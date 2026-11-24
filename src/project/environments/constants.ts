import {
  array,
  boolean,
  function_,
  looseObject,
  minLength,
  optional,
  pipe,
  string,
} from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import { environmentPresetFields } from "#batiment/environments/constants";
import { namespaceKindFields } from "#batiment/scopes/constants";
import type { NamespaceKind, TestVariant } from "#batiment/scopes/index";
import type { EnvironmentPresetEntry } from "#project/environments/ports/EnvironmentPresetEntry";
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

export const defaultStaticDirectories = freeze([
  "public",
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

export const defaultTestsSuffix = ".test" satisfies Glob;

export const defaultTestsFixtures = freeze([
  "**/fixtures/**",
] as const) satisfies Globs;

export const defaultTestsCoverageDirectory = "coverage" satisfies Directory;

export const executionGlobals = freeze([
  "isomorphic",
  "browser",
  "node",
] as const);

export const moduleFormats = freeze(["esm"] as const);

export const disabledCodeEnvironment = freeze({
  dirs: [],
  generated: [],
  discovered: [],
} as const);

export const testVariants = freeze([
  freeze({
    name: "plain",
    marker: "",
    against: freeze(["source", "dist"] as const),
    through: "public-entries",
  }),
  freeze({
    name: "src",
    marker: ".src",
    against: freeze(["source"] as const),
    through: "internal-aliases",
  }),
  freeze({
    name: "dist",
    marker: ".dist",
    against: freeze(["dist"] as const),
    through: "public-entries",
  }),
] as const) satisfies readonly TestVariant[];

export const testsNamespaceKind = freeze({
  name: "tests",
  level: "enforced",
  structure: "roles",
  layout: "mirror",
  code: "private",
  imports: freeze({
    src: "whole",
    bin: "whole",
    scripts: "whole",
    tooling: "whole",
    data: "whole",
  }),
  variants: testVariants,
} as const) satisfies NamespaceKind;

export const dataNamespaceKind = freeze({
  name: "data",
  level: "enforced",
  inward: "open",
} as const) satisfies NamespaceKind;

// @debt built as frozen data rather than with `createEnvironmentPreset`, since an extension imports statically only its constants, which import no confined util
// @debt the Node presets state no module format, so their tsconfigs keep the base tsconfig's `module` and `moduleResolution` rather than Node's
export const builtinEnvironmentPresets = freeze([
  freeze({
    name: "src",
    tsconfig: true,
    languages: ["typescript"],
    execution: freeze({ globals: "isomorphic", module: "esm" }),
  } as const),
  freeze({
    name: "tests",
    tsconfig: true,
    languages: ["typescript"],
    execution: freeze({ globals: "node" }),
  } as const),
  freeze({
    name: "bin",
    tsconfig: true,
    languages: ["typescript"],
    execution: freeze({ globals: "node" }),
  } as const),
  freeze({
    name: "scripts",
    tsconfig: true,
    languages: ["typescript"],
    execution: freeze({ globals: "node" }),
  } as const),
  freeze({
    name: "tooling",
    tsconfig: true,
    languages: ["typescript"],
    execution: freeze({ globals: "node" }),
  } as const),
  freeze({ name: "data" } as const),
  freeze({ name: "static" } as const),
] as const) satisfies readonly EnvironmentPresetEntry[];

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const environmentPresetEntry: StandardSchemaV1 = looseObject({
  ...environmentPresetFields,
  tsconfig: optional(boolean()),
});

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const namespaceKindEntry: StandardSchemaV1 = looseObject(
  namespaceKindFields,
);

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const environmentEntry: StandardSchemaV1 = looseObject({
  name: string(),
  title: string(),
  preset: optional(string()),
  owns: optional(array(string())),
});

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const languageEntry: StandardSchemaV1 = looseObject({
  name: string(),
  extensions: pipe(array(string()), minLength(1)),
  modules: optional(boolean()),
  declarations: optional(string()),
  configure: optional(function_()),
});
