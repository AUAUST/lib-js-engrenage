import { memoized } from "@auaust/toolkit/memoized";

import { declareSection } from "#foundation/options/index";
import { memoizeByContext, type ConfigResolver } from "#project/config/index";
import { createTsconfig } from "#project/tsconfig/operations/createTsconfig";
import type { Tsconfig } from "#project/tsconfig/types/Tsconfig";
import type { File } from "#types/File";

const parserFor = memoizeByContext(({ root, filesystem }) => {
  return memoized(
    // @debt the memo key holds the content of the base tsconfig only, so staged changes to a local tsconfig it extends are not seen within a pass
    (
      path: File | undefined,
      content: string | undefined,
    ): Promise<Tsconfig> => {
      return createTsconfig({
        root,
        path,
        filesystem,
        content,
      });
    },
    (path, content) => `${path}\0${content}`,
  );
});

export const tsconfigSection = declareSection({
  live: true,
  async resolve(_input, config: ConfigResolver): Promise<Tsconfig> {
    const { context } = config;

    const path = await config.resolve("tsconfigPath");

    return parserFor(context)(
      path,
      path === undefined ? undefined : await context.filesystem.read(path),
    );
  },
});
