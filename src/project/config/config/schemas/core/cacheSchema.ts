import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { directorySchema } from "#project/config/config/schemas/values/directorySchema";
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
