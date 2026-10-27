import type { GlobalScope } from "#config/types/GlobalScope";

export interface DefinitionOptions {
  exact?: boolean;
  type?: string;
  scope?: GlobalScope;
}
