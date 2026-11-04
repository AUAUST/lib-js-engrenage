import { join } from "node:path";

import { loadPrettier } from "#tools/prettier/operations/loadPrettier";
import type { Formatter } from "#foundation/filesystem/types/Formatter";
import type { Directory } from "#types/Directory";

export function createPrettierFormatter(root: Directory): Formatter {
  return async (file, content) => {
    const prettier = loadPrettier(root);

    if (prettier === undefined) {
      return;
    }

    const { ignored, inferredParser } = await prettier.getFileInfo(file, {
      ignorePath: join(root, ".prettierignore"),
      resolveConfig: true,
    });

    if (ignored || inferredParser === null) {
      return;
    }

    const options = await prettier.resolveConfig(file);

    return prettier.format(content, {
      ...options,
      filepath: file,
    });
  };
}
