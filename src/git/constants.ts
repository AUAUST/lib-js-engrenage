import { freeze } from "@auaust/toolkit/object";

import { coverageDirectory } from "#config/constants";
import type { GlobGroup } from "#types/GlobGroup";

export const javascriptIgnores = freeze({
  title: "JavaScript",
  globs: freeze([
    "node_modules",
    ".pnp.*",
    ".pnpm-store",
    "*.tgz",
    "*.tsbuildinfo",
    ".eslintcache",
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
    ".nova",
    "*.sublime-workspace",
    "*.sw?",
    "*.suo",
    "*.ntvs*",
    "*.njsproj",
    "*.sln",
  ] as const),
} as const) satisfies GlobGroup;

export const coverageIgnores = freeze({
  title: "Coverage",
  globs: freeze([`/${coverageDirectory}`] as const),
} as const) satisfies GlobGroup;

export const outputTitle = "Output";

export const defaultIgnores: ReadonlyArray<GlobGroup> = freeze([
  javascriptIgnores,
  lockfileIgnores,
  osIgnores,
  envIgnores,
  logIgnores,
  editorIgnores,
  coverageIgnores,
] as const) satisfies ReadonlyArray<GlobGroup>;
