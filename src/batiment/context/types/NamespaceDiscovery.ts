import type { NamespaceKind } from "#batiment/scopes/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface NamespaceDiscovery {
  readonly dirs: Directories;
  readonly rootFiles: Globs;
  readonly active: boolean;
  /**
   * The kind the top-level namespace takes, from its `.namespace.json`
   * or its config.
   */
  readonly kind: NamespaceKind;
}
