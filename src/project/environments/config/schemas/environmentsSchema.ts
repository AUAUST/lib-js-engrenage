import { array, boolean, string } from "valibot";

import { declareLanguages } from "#batiment/environments/index";
import {
  declare,
  declareObject,
  declareRecord,
  directorySchema,
  globSchema,
} from "#foundation/options/index";
import { environmentTsconfigSchema } from "#project/environments/config/schemas/environmentTsconfigSchema";
import { executionSchema } from "#project/environments/config/schemas/executionSchema";

export const environmentsSchema = declareRecord(
  string(),
  declareObject(
    {
      preset: declare(string(), {
        description: "Name of the environment preset the environment tunes; defaults to the preset of a built-in environment's name, and is required for any other.",
        optional: { value: undefined },
      }),
      languages: declareLanguages(
        "Names of the registered languages the environment holds instead of its preset's; a built-in environment defaults to its options' `languages`.",
      ),
      execution: executionSchema,
      bundled: declare(boolean(), {
        description: "Whether the environment's code only runs through a bundler pass, instead of its preset's; unset in both, the build tool's for the environments on the package entries, else `false`. It sets the tsconfig `module` and `moduleResolution` to the bundler ones and, on `src`, writes the src aliases to the tsconfig `paths` and allows bundler aliases in `aliases.define`.",
        optional: { value: undefined },
      }),
      dirs: declare(array(directorySchema), {
        description: "Directories the environment is placed on, each covering its subtree, a workspace's included, a glob placing it on each directory it matches; a built-in environment defaults to its top-level namespace's resolved directories.",
        optional: { value: undefined },
      }),
      files: declare(array(globSchema), {
        description: "Globs, matched at the project root only, of the files the environment is placed on; a built-in environment defaults to its options' `files` when its `dirs` option includes `.`.",
        optional: { value: undefined },
      }),
      tsconfig: environmentTsconfigSchema,
    },
    {
      description: "The registration of one environment: its preset, its tuning and its placements.",
    },
  ),
  {
    description: [
      "Environments of the project by name, each registering an environment preset placed on directories and root files.",
      "An entry named after a built-in environment adjusts its default registration field by field.",
    ],
    optional: {
      value: {},
    },
  },
);
