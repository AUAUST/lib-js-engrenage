import type { Registry } from "#foundation/extensions/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface ConfigContext {
  readonly root: Directory;
  readonly filesystem: Filesystem;
  readonly configFile: File | undefined;
  readonly registry: Registry<Extension, ConfigResolver>;
  path(...paths: string[]): string;
  copy(): LoadedConfig;
}
