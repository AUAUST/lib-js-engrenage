import type { ResolvedBuild } from "#project/build/index";
import type { ProjectConfig } from "#project/config/index";
import type {
  ResolvedBaseTsconfig,
  ResolvedTypescript,
} from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface ConventionBuild extends Omit<ResolvedBuild, "outDir"> {
  readonly outDir: Directory | undefined;
}

interface ConventionTypescript extends Omit<ResolvedTypescript, "tsconfig"> {
  readonly tsconfig: Omit<ResolvedBaseTsconfig, "path"> & {
    readonly path: File | undefined;
  };
}

export interface ConventionConfig extends Pick<
  ProjectConfig,
  | "root"
  | "raw"
  | "structure"
  | "importRules"
  | "src"
  | "tests"
  | "bin"
  | "scripts"
  | "tooling"
  | "data"
  | "files"
  | "packageJson"
  | "environment"
  | "traits"
  | "roles"
  | "workspaces"
> {
  readonly build: ConventionBuild;
  readonly typescript: ConventionTypescript;
}
