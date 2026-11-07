import type { ResolvedBuild } from "#project/build/index";
import type { Environment } from "#project/config/index";
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
import type {
  EntityIndex,
  ImportGrants,
  ResolvedFiles,
  ResolvedRoles,
  ResolvedSpecifier,
  ResolvedStructure,
  StructureEnvironmentName,
} from "#project/structure/index";
import type {
  ResolvedBaseTsconfig,
  ResolvedTypescript,
} from "#project/tsconfig/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface ConventionBuild extends ResolvedBuild {
  readonly outDir: Directory | undefined;
}

interface ConventionTypescript extends Omit<ResolvedTypescript, "tsconfig"> {
  readonly tsconfig: ResolvedBaseTsconfig & {
    readonly path: File | undefined;
  };
}

export interface ConventionConfig {
  readonly root: Directory;
  readonly structure: ResolvedStructure;
  readonly entities: EntityIndex;
  readonly grants: ImportGrants;
  resolveImport(specifier: string, from: File): ResolvedSpecifier | undefined;
  readonly roles: Readonly<Record<StructureEnvironmentName, ResolvedRoles>>;
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
