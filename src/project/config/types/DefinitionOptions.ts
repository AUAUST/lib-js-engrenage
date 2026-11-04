import type { GlobalScope } from "#project/config/types/GlobalScope";

export interface DefinitionOptions {
  exact?: boolean;
  type?: string;
  scope?: GlobalScope;
  description?: string;
}
