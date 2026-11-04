import { declareList } from "#foundation/options/config/declareList";
import { directorySchema } from "#foundation/options/config/schemas/directorySchema";
import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { defaultDataDirectories } from "#project/environments/constants";
import { exposedFilesSchema } from "#project/package/config/schemas/exposedFilesSchema";

export const dataSchema = declareObject(
  {
    dirs: declareList(directorySchema, {
      description:
        "Directories of static data files shipped with the package, listed in the `files` of `package.json`.",
      optional: { value: defaultDataDirectories },
    }),
    exports: declare(exposedFilesSchema, {
      description:
        "Subpaths the package exposes, mapped to a data file; both sides use the same single `*` or none. tsdown adds them to the `exports` of `package.json`, and a subpath that `src.exports` also exposes fails.",
      optional: {
        value: {},
      },
    }),
  },
  {
    description: ["The data environment.", "`false` ships no data directory."],
    optional: true,
    disable: {
      value: {
        dirs: [],
        exports: {},
      },
    },
  },
);
