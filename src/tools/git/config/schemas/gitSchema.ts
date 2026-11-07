import { boolean } from "valibot";

import { gitignoreFile } from "#constants";
import {
  declare,
  declareLocation,
  declareObject,
  globSchema,
  listOptionSchema,
  unset,
} from "#foundation/options/index";

export const gitSchema = declareObject(
  {
    gitignore: declareLocation({
      description:
        "The `.gitignore` file that sync updates with the generated and built paths, and that ESLint reads to skip files.",
      optional: { value: gitignoreFile },
    }),
    local: declareObject(
      {
        gitignore: declare(boolean(), {
          optional: { value: true },
        }),
        // @debt the default is computed by agents/operations/listLocalFilePatterns, and the declaration only documents it
        files: declare(listOptionSchema(globSchema), {
          description:
            "Local files protected from additions and modifications in commits, using project-root-relative .gitignore syntax. Append adds globs; exclude removes exact matches; an array replaces the defaults.",
          optional: unset(
            "The .gitignore patterns when git.local.gitignore is true, followed by .ai/issues/, deduplicated.",
          ),
        }),
      },
      {
        optional: true,
      },
    ),
  },
  {
    optional: true,
  },
);
