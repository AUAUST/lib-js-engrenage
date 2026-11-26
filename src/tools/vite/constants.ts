import { freeze } from "@auaust/toolkit/object";

export { vite } from "#constants";

/**
 * Loads the Vite config through Node instead of Vite's bundled loader.
 */
export const nativeConfigLoader = freeze(["--configLoader", "native"] as const);
