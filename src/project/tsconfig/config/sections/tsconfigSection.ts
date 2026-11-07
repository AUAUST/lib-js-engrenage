import { memoized } from "@auaust/toolkit/memoized";

import { declareSection, type Resolver } from "#foundation/options/index";
import { memoizeByContext, type ConfigContext } from "#project/config/index";
import { tsconfigPathSection } from "#project/tsconfig/config/sections/tsconfigPathSection";
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
  name: "tsconfig",
  live: true,
  async resolve(_input, config: Resolver<ConfigContext>): Promise<Tsconfig> {
    const { context } = config;

    const path = await config.resolve(tsconfigPathSection);

    return parserFor(context)(
      path,
      path === undefined ? undefined : await context.filesystem.read(path),
    );
  },
});
