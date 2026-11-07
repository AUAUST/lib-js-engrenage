import { freeze } from "@auaust/toolkit/object";

import type { GlobalScope } from "#project/config/types/GlobalScope";

export const defaultDefineTypes = true;

export const defaultGlobalScope = "all" satisfies GlobalScope;

export const globalScopes = freeze(["all", "test", "build"] as const);

export const definitionKey = "~definition";

export const globalNamePattern = freeze(
  /^(?:import\.meta|[$A-Z_a-z][\w$]*)(?:\.[$A-Z_a-z][\w$]*)*$/,
);
