import { function_, looseObject, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";
import type { File } from "#types/File";
import type { GlobGroup } from "#types/GlobGroup";

export const javascriptIgnores = freeze({
  title: "JavaScript",
  globs: freeze([
    "node_modules",
    ".pnp.*",
    ".pnpm-store",
    "*.tgz",
    "*.tsbuildinfo",
    "npm-debug.log*",
    "pnpm-debug.log*",
  ] as const),
} as const) satisfies GlobGroup;

export const lockfileIgnores = freeze({
  title: "Package locks",
  globs: freeze([
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
  ] as const),
} as const) satisfies GlobGroup;

export const osIgnores = freeze({
  title: "Operating systems",
  globs: freeze([
    ".DS_Store",
    "._*",
    ".Spotlight-V100",
    ".Trashes",
    "Thumbs.db",
    "ehthumbs.db",
  ] as const),
} as const) satisfies GlobGroup;

export const envIgnores = freeze({
  title: "Environment",
  globs: freeze([".env", ".env.*", "!.env.example"] as const),
} as const) satisfies GlobGroup;

export const logIgnores = freeze({
  title: "Logs",
  globs: freeze(["/logs", "*.log"] as const),
} as const) satisfies GlobGroup;

export const editorIgnores = freeze({
  title: "Editors",
  globs: freeze([
    ".idea",
    ".fleet",
    // @debt Agent worktrees are not editor files; an agents group, or the agents domain contributing its own ignores, would own this glob.
    ".claude/worktrees",
    ".nova",
    "*.sublime-workspace",
    "*.sw?",
    "*.suo",
    "*.ntvs*",
    "*.njsproj",
    "*.sln",
  ] as const),
} as const) satisfies GlobGroup;

export const defaultIgnores: readonly GlobGroup[] = freeze([
  javascriptIgnores,
  lockfileIgnores,
  osIgnores,
  envIgnores,
  logIgnores,
  editorIgnores,
] as const) satisfies readonly GlobGroup[];

export const hashBlocks = freeze({
  open: "# ",
  close: "",
  padding: "\n\n",
} as const) satisfies BlockSyntax;

export const ignoreBlocks = "# @ignore defaults\n\n# @ignore project\n\n# @end\n";

export const gitattributesFile = ".gitattributes" satisfies File;

export const attributesBlock = "# @attributes\n\n# @end\n";

export const gitDirectory = ".git";

export const commitSubjectLimit = 72;

// @debt the git rule's type table (`data/metalbrain/rules/git.md`) restates this list by hand instead of being rendered from it
export const commitTypes = freeze([
  "feat",
  "fix",
  "imp",
  "cq",
  "docs",
  "brain",
  "css",
  "tests",
  "update",
  "content",
  "assets",
  "files",
  "snap",
  "config",
  "debug",
  "meta",
] as const);

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const ignoreFileEntry: StandardSchemaV1 = looseObject({
  name: string(),
  load: function_(),
});
