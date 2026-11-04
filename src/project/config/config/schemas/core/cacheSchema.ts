import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { defaultCacheDirectory } from "#config/constants";
import { resolveWithin } from "#filesystem/utils/resolveWithin";
import { declare } from "#options/utils/declare";
import { declareObject } from "#options/utils/declareObject";
import type { ConfigContext } from "#config/types/ConfigContext";

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
