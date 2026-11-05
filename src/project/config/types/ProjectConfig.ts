import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedBuild } from "#project/build/index";
import type { Environment } from "#project/config/types/Environment";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { ResolvedCache } from "#project/config/types/ResolvedCache";
import type { ResolvedDefine } from "#project/config/types/ResolvedDefine";
import type { ResolvedFiles } from "#project/config/types/ResolvedFiles";
import type { ResolvedRuntimeSettings } from "#project/config/types/ResolvedRuntimeSettings";
import type {
  ResolvedBin,
  ResolvedData,
  ResolvedScripts,
  ResolvedSource,
  ResolvedTests,
  ResolvedTooling,
} from "#project/environments/index";
import type { Conventions } from "#project/format/index";
import type { PackageJson } from "#project/package/index";
import type {
  Preset,
  ResolvedTraitAdjustments,
  ResolvedTraits,
} from "#project/presets/index";
import type {
  ImportRule,
  ProjectRoles,
  ResolvedAliases,
  ResolvedStructure,
} from "#project/structure/index";
import type { ResolvedTypescript, Tsconfig } from "#project/tsconfig/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { PackageName } from "#types/PackageName";

export interface ProjectConfig {
  readonly root: Directory;
  readonly raw: RawConfig;
  readonly configFile: File | undefined;
  readonly debug: boolean;
  readonly filesystem: Filesystem;
  resolve(...paths: string[]): string;
  cacheFor(packageName: PackageName): Directory;
  readonly packageJsonPath: File | undefined;
  readonly packageJson: PackageJson;
  readonly tsconfig: Tsconfig;
  readonly environment: Environment;
  readonly preset: Preset | undefined;
  readonly traitAdjustments: ResolvedTraitAdjustments;
  readonly traits: ResolvedTraits;
  readonly roles: ProjectRoles;
  readonly format: Conventions;
  readonly runtime: ResolvedRuntimeSettings;
  readonly define: ResolvedDefine;
  readonly src: ResolvedSource;
  readonly tests: ResolvedTests;
  readonly bin: ResolvedBin;
  readonly scripts: ResolvedScripts;
  readonly data: ResolvedData;
  readonly tooling: ResolvedTooling;
  readonly workspaces: readonly ResolvedWorkspaceGroup[];
  readonly structure: ResolvedStructure;
  readonly aliases: ResolvedAliases;
  readonly importRules: readonly ImportRule[];
  readonly files: ResolvedFiles;
  readonly build: ResolvedBuild;
  readonly cache: ResolvedCache;
  readonly typescript: ResolvedTypescript;
}
