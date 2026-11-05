import { freeze } from "@auaust/toolkit/object";

import type { GlobalScope } from "#project/config/types/GlobalScope";
import type { Directory } from "#types/Directory";

export const debugEnvironmentVariable = "ENGRENAGE_DEBUG";

export const defaultDefineTypes = true;

export const defaultGlobalScope = "all" satisfies GlobalScope;

export const globalScopes = freeze(["all", "test", "build"] as const);

export const defaultCacheDirectory = "node_modules/.cache" satisfies Directory;

export const definitionKey = "~definition";

export const globalNamePattern = freeze(
  /^(?:import\.meta|[$A-Z_a-z][\w$]*)(?:\.[$A-Z_a-z][\w$]*)*$/,
);

// @debt test-variant suffixes belong to the tests environment (`project/environments`)
export const sourceTestsVariant = ".src";

export const distTestsVariant = ".dist";
