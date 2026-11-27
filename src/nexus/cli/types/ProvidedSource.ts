import type { ProvidedEntry } from "#nexus/cli/types/ProvidedEntry";

/**
 * The subcommands one source of a group provides, and whether they yield to the
 * names an earlier source provides.
 */
export interface ProvidedSource {
  readonly shadowable: boolean;
  readonly entries: readonly ProvidedEntry[];
}
