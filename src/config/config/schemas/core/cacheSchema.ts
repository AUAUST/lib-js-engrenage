import { description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { defaultCacheDirectory } from "#config/constants";

export const cacheSchema = strictObject({
  dir: optional(
    pipe(
      directorySchema,
      description(
        join(
          [
            "Directory, inside the project, where tools keep their caches (TypeScript build info, ESLint), one folder per tool.",
            `@default \`${defaultCacheDirectory}\``,
          ],
          "\n",
        ),
      ),
    ),
  ),
});
