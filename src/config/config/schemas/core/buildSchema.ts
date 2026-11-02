import { boolean, description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { defaultEmptyOutDir, defaultSourcemap } from "#config/constants";

export const buildSchema = strictObject({
  outDir: optional(
    pipe(
      directorySchema,
      description(
        join(
          [
            "Output directory of tsdown and Vite, ignored by Git and ESLint and listed in the published `files` of `package.json`.",
            "@default `compilerOptions.outDir` of the base tsconfig; building fails when neither is set",
          ],
          "\n",
        ),
      ),
    ),
  ),
  emptyOutDir: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether a build empties the output directory first (the `clean` option of tsdown).",
            `@default \`${defaultEmptyOutDir}\``,
          ],
          "\n",
        ),
      ),
    ),
  ),
  sourcemap: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether builds emit source maps and the source directories are published with them.",
            `@default \`${defaultSourcemap}\``,
          ],
          "\n",
        ),
      ),
    ),
  ),
  typed: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether tsdown emits declaration files.",
            "@default `define.types`",
          ],
          "\n",
        ),
      ),
    ),
  ),
});
