import { freeze } from "@auaust/toolkit/object";

export const metadataFields = freeze([
  "$schema",
  "name",
  "version",
  "private",
  "description",
  "keywords",
  "homepage",
  "bugs",
  "repository",
  "funding",
  "license",
  "author",
  "contributors",
] as const);

export const moduleFields = freeze([
  "type",
  "bin",
  "scripts",
  "imports",
  "exports",
  "main",
  "module",
  "types",
  "files",
  "workspaces",
] as const);

export const dependencyFields = freeze([
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const);

export const dependencyOptionFields = freeze([
  "peerDependenciesMeta",
  "inlinedDependencies",
  "bundleDependencies",
  "overrides",
  "resolutions",
] as const);

export const toolFields = freeze(["sideEffects", "prettier"] as const);

export const environmentFields = freeze([
  "packageManager",
  "engines",
  "devEngines",
] as const);

export const publishingFields = freeze(["publishConfig", "pnpm"] as const);

export const packageJsonPropertyOrder = freeze([
  ...metadataFields,
  ...moduleFields,
  ...dependencyFields,
  ...dependencyOptionFields,
  ...toolFields,
  ...environmentFields,
  ...publishingFields,
] as const);

export const initialVersion = "0.0.0";

export const publicLicense = "GPL-3.0-only";

export const privateLicense = "UNLICENSED";

export const visibilities = freeze(["public", "private"] as const);
