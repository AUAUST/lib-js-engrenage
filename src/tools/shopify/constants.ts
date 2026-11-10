import type { Glob } from "#types/Glob";

export { shopifyCli } from "#constants";
export { directoryPlaceholder } from "#project/workspaces/constants";

export const extensionsGlob = "extensions/*" satisfies Glob;

export const appConfigGlob = "shopify.app*.toml" satisfies Glob;
