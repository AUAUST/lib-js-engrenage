import { description, optional, pipe } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { dirsSchema } from "#config/config/schemas/values/dirsSchema";
import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { exposedFilesSchema } from "#config/config/schemas/values/exposedFilesSchema";
import { defaultDataDirectories } from "#config/constants";
import { listDefaults } from "#config/utils/listSchemaDefaults";

export const dataSchema = pipe(
  environmentSchema({
    dirs: optional(
      pipe(
        dirsSchema,
        description(
          join(
            [
              "Directories of static data files shipped with the package, listed in the `files` of `package.json`.",
              `@default ${listDefaults(defaultDataDirectories)}`,
            ],
            "\n",
          ),
        ),
      ),
    ),
    exports: optional(
      pipe(
        exposedFilesSchema,
        description(
          join(
            [
              "Subpaths the package exposes, mapped to a data file; both sides use the same single `*` or none. tsdown adds them to the `exports` of `package.json`, and a subpath that `src.exports` also exposes fails.",
              "@default none",
            ],
            "\n",
          ),
        ),
      ),
    ),
  }),
  description(
    join(["The data environment.", "`false` ships no data directory."], "\n"),
  ),
);
