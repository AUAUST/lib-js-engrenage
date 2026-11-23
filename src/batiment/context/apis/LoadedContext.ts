import type { ContextDiscovery } from "#batiment/context/types/ContextDiscovery";
import type { ResolvedStructure } from "#batiment/structure/index";
import type { Directory } from "#types/Directory";

export interface LoadedContext {
  /**
   * Discovers the workspaces, metafiles and environment placements once.
   */
  discover(): Promise<ContextDiscovery>;
  /**
   * Walks the scope at `dir` once, after discovery.
   */
  walk(dir: Directory): Promise<ResolvedStructure>;
}
