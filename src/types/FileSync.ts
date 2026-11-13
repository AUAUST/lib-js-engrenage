import type { MaybePromise } from "@auaust/toolkit/types";

import type { File } from "#types/File";

/**
 * An update to an existing file: `update` receives its content and absolute path
 * and returns the new content. A missing file is skipped, never created.
 */
export interface FileSync {
  file: File;
  update(content: string, path: File): MaybePromise<string>;
}
