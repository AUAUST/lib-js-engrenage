import type {
  ResolvedBin,
  ResolvedScripts,
  ResolvedSource,
  ResolvedTests,
  ResolvedTooling,
} from "#project/environments/index";
import type { ResolvedFiles } from "#project/structure/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/index";

export interface ScopeSources {
  readonly src: ResolvedSource;
  readonly tests: ResolvedTests;
  readonly bin: ResolvedBin;
  readonly scripts: ResolvedScripts;
  readonly tooling: ResolvedTooling;
  readonly files: ResolvedFiles;
  readonly workspaces: readonly ResolvedWorkspaceGroup[];
}
