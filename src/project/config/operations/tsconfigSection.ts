import { memoized } from "@auaust/toolkit/memoized";

import { declareSection, type Resolver } from "#foundation/options/index";
import { locateTsconfigPath } from "#project/config/operations/locateTsconfigPath";
import { memoizeByContext } from "#project/config/utils/memoizeByContext";
import { createTsconfig, type Tsconfig } from "#project/tsconfig/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
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

    const path = await locateTsconfigPath(config);

    return parserFor(context)(
      path,
      path === undefined ? undefined : await context.filesystem.read(path),
    );
  },
});
