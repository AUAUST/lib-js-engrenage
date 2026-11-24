import { freeze } from "@auaust/toolkit/object";

import type { GlobalScope } from "#project/config/types/GlobalScope";
import type { KeyScope } from "#project/config/types/KeyScope";
import type { Directory } from "#types/Directory";

export const stateDirectory = ".engrenage" satisfies Directory;

export const defaultDefineTypes = true;

export const defaultGlobalScope = "all" satisfies GlobalScope;

export const globalScopes = freeze(["all", "test", "build"] as const);

export const definitionKey = "~definition";

export const globalNamePattern = freeze(
  /^(?:import\.meta|[$A-Z_a-z][\w$]*)(?:\.[$A-Z_a-z][\w$]*)*$/,
);

export const unpresettable: readonly string[] = freeze([
  "preset",
  "extensions",
]);

export const keyScopes = freeze(["project", "scoped", "inherited"] as const);

export const defaultKeyScope = "scoped" satisfies KeyScope;
