import type {
  ContributedEnvironment,
  ResolvedTests,
} from "#project/environments/index";
import type { ResolvedFiles } from "#project/structure/index";

export interface ScopeSources {
  readonly environments: Readonly<
    Partial<Record<string, ContributedEnvironment>>
  >;
  readonly tests: ResolvedTests;
  readonly files: ResolvedFiles;
}
