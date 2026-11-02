import type { AttwOptions } from "tsdown";

import { freeze } from "@auaust/toolkit/object";

export const binEntryFiles = freeze(["*.ts", "*/index.ts"] as const);

export const mainFields = freeze(["module", "main"] as const);

export const emptyNamespaces = "empty-namespaces";

export const pluginNames = freeze([emptyNamespaces] as const);

export const attwOptions = freeze({
  profile: "node16",
  ignoreRules: ["cjs-resolves-to-esm"],
} as const satisfies AttwOptions);

export const builtExtension = ".mjs";

export const targetBrowsers: Readonly<Record<string, string>> = freeze({
  chrome: "chrome",
  edge: "edge",
  firefox: "firefox",
  safari: "safari",
  safari_ios: "ios",
});

export { project as pluginPrefix } from "#constants";
