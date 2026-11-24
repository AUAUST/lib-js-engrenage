import type { MatchedWorkspace } from "#batiment/context/types/MatchedWorkspace";
import type { RootFacts } from "#batiment/context/types/RootFacts";
import type { ScopeDeclarations } from "#batiment/context/types/ScopeDeclarations";
import type { ScopeRegistry } from "#batiment/context/types/ScopeRegistry";
import type { Directory } from "#types/Directory";

export interface ContextPort {
  /**
   * The root's registries, environment placements and workspace expectations,
   * answerable before discovery.
   */
  root(): Promise<RootFacts>;
  /**
   * The registry of `workspace`, asked by discovery once it has found and matched
   * it, so the answer reads no discovery output.
   */
  registry(workspace: MatchedWorkspace): Promise<ScopeRegistry>;
  /**
   * The declarations of the scope at `dir`, `.` for the root, asked after
   * discovery since they follow the environments it finds active; the root's
   * lists its active structure environments.
   */
  scope(dir: Directory): Promise<ScopeDeclarations>;
}
