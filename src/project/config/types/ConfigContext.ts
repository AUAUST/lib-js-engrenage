import type { MatchedWorkspace } from "#batiment/context/index";
import type { Registry } from "#foundation/extensions/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Reporter, ReportingContext } from "#foundation/reports/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface ConfigContext extends ReportingContext {
  readonly root: Directory;
  /**
   * The root-relative directory of the scope the config resolves, `.` for
   * the project's root.
   */
  readonly scopeDir: Directory;
  readonly filesystem: Filesystem;
  readonly configFile: File | undefined;
  readonly registry: Registry<Extension, ConfigResolver>;
  path(...paths: string[]): string;
  /**
   * A fresh load of the project's root config, reporting through `reporter`.
   */
  copy(options?: { reporter?: Reporter }): LoadedConfig;
  /**
   * The child resolver of the workspace discovery has found and matched, created
   * from its facts once per load, so discovery can resolve it before it ends.
   *
   * @throws When its glob entry or `.workspace.json` sets a project-only
   * or unknown key.
   */
  workspace(workspace: MatchedWorkspace): Promise<LoadedConfig>;
  /**
   * The config of the scope at `dir`, root-relative, after discovery: the root's
   * for `.`, else the child resolver discovery created for the workspace.
   *
   * @throws When no workspace lies at `dir`, or discovery fails.
   */
  scope(dir: Directory): Promise<LoadedConfig>;
}
