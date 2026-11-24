import type { Glob } from "#types/Glob";

export { shopifyCli } from "#constants";
export { typescript } from "#constants";

export const extensionsGlob = "extensions/*" satisfies Glob;

export const extensionsWorkspaceKey = `workspaces.globs.${extensionsGlob}`;

export const extensionsEnvironmentKey = `${extensionsWorkspaceKey}.environments.shopify-extensions`;

export const appConfigGlob = "shopify.app*.toml" satisfies Glob;

export { directoryPlaceholder } from "#project/workspaces/constants";
