import { resolveWithin } from "#foundation/filesystem/index";
import {
  declare,
  declareObject,
  directorySchema,
} from "#foundation/options/index";
import { defaultCacheDirectory } from "#project/config/constants";
import type { ConfigContext } from "#project/config/types/ConfigContext";

export const cacheSchema = declareObject(
  {
    dir: declare(directorySchema, {
      description:
        "Directory, inside the project, where tools keep their caches (TypeScript build info, ESLint), one folder per tool.",
      optional: { value: defaultCacheDirectory },
      adjust(input, _fallback, context: ConfigContext) {
        resolveWithin(context.get("root"), input);

        return input;
      },
    }),
  },
  {
    optional: true,
  },
);
