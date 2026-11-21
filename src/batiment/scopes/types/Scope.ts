import type { ScopedEnvironment } from "#batiment/scopes/types/ScopedEnvironment";
import type { Directory } from "#types/Directory";

export interface Scope {
  readonly key: string;
  readonly dir: Directory;
  readonly parent: string | undefined;
  readonly purpose?: string;
  readonly environments: readonly ScopedEnvironment[];
}
