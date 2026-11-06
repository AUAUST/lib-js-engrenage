import type { ResolvedBuild } from "#project/build/index";
import type {
  Environment,
  RawConfig,
  ResolvedFiles,
} from "#project/config/index";
import type {
  ResolvedBin,
  ResolvedData,
  ResolvedScripts,
  ResolvedSource,
  ResolvedTests,
  ResolvedTooling,
} from "#project/environments/index";
import type { PackageJson } from "#project/package/index";
import type { ResolvedTraits } from "#project/presets/index";
import type { ImportRule, ResolvedStructure } from "#project/structure/index";
import type {
  ResolvedBaseTsconfig,
  ResolvedTypescript,
} from "#project/tsconfig/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/index";
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

export interface ConventionConfig {
  readonly root: Directory;
  readonly raw: RawConfig;
  readonly structure: ResolvedStructure;
  readonly importRules: readonly ImportRule[];
  readonly src: ResolvedSource;
  readonly tests: ResolvedTests;
  readonly bin: ResolvedBin;
  readonly scripts: ResolvedScripts;
  readonly tooling: ResolvedTooling;
  readonly data: ResolvedData;
  readonly files: ResolvedFiles;
  readonly packageJson: PackageJson;
  readonly environment: Environment;
  readonly traits: ResolvedTraits;
  readonly workspaces: readonly ResolvedWorkspaceGroup[];
  readonly build: ConventionBuild;
  readonly typescript: ConventionTypescript;
}
