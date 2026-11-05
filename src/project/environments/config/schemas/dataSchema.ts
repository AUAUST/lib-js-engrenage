import {
  declare,
  declareList,
  declareObject,
  directorySchema,
} from "#foundation/options/index";
import { defaultDataDirectories } from "#project/environments/constants";
import { exposedFilesSchema } from "#project/package/index";

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
