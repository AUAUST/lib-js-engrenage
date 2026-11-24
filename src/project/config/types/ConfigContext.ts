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
   * The config of the scope at `dir`, root-relative: the root's for `.`, else
   * the workspace's child resolver, created once per load.
   *
   * @throws When no workspace lies at `dir`, or its glob entry or
   * `.workspace.json` sets a project-only or unknown key.
   */
  scope(dir: Directory): Promise<LoadedConfig>;
}
