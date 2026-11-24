import type { DiscoveredWorkspace } from "#batiment/scopes/index";
import type { Glob } from "#types/Glob";

/**
 * A discovered workspace with the `workspaces` glob matching it, unset
 * when none does.
 */
export interface MatchedWorkspace extends DiscoveredWorkspace {
  readonly glob?: Glob;
}
