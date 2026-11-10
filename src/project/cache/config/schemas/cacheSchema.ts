import { resolveWithin } from "#foundation/filesystem/index";
import {
  declare,
  declareObject,
  directorySchema,
} from "#foundation/options/index";
import { defaultCacheDirectory } from "#project/cache/constants";
import type { Directory } from "#types/Directory";

export const cacheSchema = declareObject(
  {
    dir: declare(directorySchema, {
      description: "Directory, inside the project, where tools keep their caches (TypeScript build info, jscpd), one folder per tool.",
      optional: { value: defaultCacheDirectory },
      adjust(input, _fallback, context: { root: Directory }) {
        resolveWithin(context.root, input);

        return input;
      },
    }),
  },
  {
    optional: true,
  },
);
