import { memoized } from "@auaust/toolkit/memoized";

import { declareSection, type Resolver } from "#foundation/options/index";
import { memoizeByContext, type ConfigContext } from "#project/config/index";
import { packageJsonPathSection } from "#project/package/config/sections/packageJsonPathSection";
import { createPackageJson } from "#project/package/operations/createPackageJson";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { File } from "#types/File";

const parserFor = memoizeByContext(({ root }) => {
  return memoized(
    (path: File | undefined, content: string | undefined): PackageJson => {
      return createPackageJson({
        root,
        path,
        content,
      });
    },
    (path, content) => `${path}\0${content}`,
  );
});

export const packageJsonSection = declareSection({
  name: "packageJson",
  live: true,
  async resolve(_input, config: Resolver<ConfigContext>): Promise<PackageJson> {
    const { context } = config;

    const path = await config.resolve(packageJsonPathSection);

    return parserFor(context)(
      path,
      path === undefined ? undefined : await context.filesystem.read(path),
    );
  },
});
