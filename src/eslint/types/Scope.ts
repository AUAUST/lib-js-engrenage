import type { ScopeReference } from "#eslint/types/ScopeReference";

export interface Scope {
  files: ScopeReference[];
  ignores: ScopeReference[];
}
