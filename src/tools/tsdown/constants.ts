import { freeze } from "@auaust/toolkit/object";

export const mainFields = freeze(["module", "main"] as const);

export const emptyNamespaces = "empty-namespaces";

export const entrySelfReferences = "entry-self-references";

export const pluginNames = freeze([
  emptyNamespaces,
  entrySelfReferences,
] as const);

export const builtExtension = ".mjs";

export const targetBrowsers: Readonly<Record<string, string>> = freeze({
  chrome: "chrome",
  edge: "edge",
  firefox: "firefox",
  safari: "safari",
  safari_ios: "ios",
});

export { project as pluginPrefix } from "#constants";
