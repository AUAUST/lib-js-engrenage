import { freeze } from "@auaust/toolkit/object";

export const mainFields = freeze(["module", "main"] as const);

export const emptyNamespaces = "empty-namespaces";

export const entrySelfReferences = "entry-self-references";

export const pluginNames = freeze([
  emptyNamespaces,
  entrySelfReferences,
] as const);

export const builtExtension = ".mjs";

export { project as pluginPrefix, tsdown } from "#constants";

export { buildSourcesFile } from "#project/build/constants";
