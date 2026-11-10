import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { FileLocation } from "#project/config/types/FileLocation";

// @debt `locate` must return a promise, so a constant location trips `require-await`; accepting a plain `FileLocation` would fit it
export interface FileResource {
  locate(config: ConfigResolver): Promise<FileLocation | undefined>;
  readonly title?: string;
  readonly committed?: boolean;
  readonly generated?: boolean;
  readonly formatted?: boolean;
  readonly parts?: boolean;
}
