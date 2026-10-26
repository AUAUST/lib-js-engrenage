import { freeze } from "@auaust/toolkit/object";

import { coverageDirectory } from "#config/constants";
import type { GlobGroup } from "#types/GlobGroup";

export const javascriptIgnores: GlobGroup = freeze({
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
  ]),
});

export const lockfileIgnores: GlobGroup = freeze({
  title: "Package locks",
  globs: freeze(["package-lock.json", "yarn.lock", "bun.lock", "bun.lockb"]),
});

export const osIgnores: GlobGroup = freeze({
  title: "Operating systems",
  globs: freeze([
    ".DS_Store",
    "._*",
    ".Spotlight-V100",
    ".Trashes",
    "Thumbs.db",
    "ehthumbs.db",
  ]),
});

export const envIgnores: GlobGroup = freeze({
  title: "Environment",
  globs: freeze([".env", ".env.*", "!.env.example"]),
});

export const logIgnores: GlobGroup = freeze({
  title: "Logs",
  globs: freeze(["/logs", "*.log"]),
});

export const editorIgnores: GlobGroup = freeze({
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
  ]),
});

export const coverageIgnores: GlobGroup = freeze({
  title: "Coverage",
  globs: freeze([`/${coverageDirectory}`]),
});

export const outputTitle = "Output";

export const defaultIgnores: ReadonlyArray<GlobGroup> = freeze([
  javascriptIgnores,
  lockfileIgnores,
  osIgnores,
  envIgnores,
  logIgnores,
  editorIgnores,
]);
