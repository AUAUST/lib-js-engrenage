import { freeze } from "@auaust/toolkit/object";

export { vite } from "#constants";

/**
 * Loads the Vite config through Node, honoring its `--conditions`, where Vite's
 * bundled loader resolves packages with fixed conditions.
 */
export const nativeConfigLoader = freeze(["--configLoader", "native"] as const);
