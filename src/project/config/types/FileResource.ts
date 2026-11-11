import type { MaybePromise } from "@auaust/toolkit/types";

import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { FileLocation } from "#project/config/types/FileLocation";

/** @stable */
export interface FileResource {
  locate(config: ConfigResolver): MaybePromise<FileLocation | undefined>;
  readonly title?: string;
  readonly committed?: boolean;
  readonly generated?: boolean;
  readonly formatted?: boolean;
  readonly parts?: boolean;
}
