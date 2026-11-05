import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface ConfigContext {
  readonly root: Directory;
  readonly filesystem: Filesystem;
  readonly configFile: File | undefined;
  path(...paths: string[]): string;
}
