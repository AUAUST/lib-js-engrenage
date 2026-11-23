import { array, string } from "valibot";

import { declareLanguages } from "#batiment/environments/index";
import {
  declare,
  declareObject,
  declareRecord,
  directorySchema,
  globSchema,
} from "#foundation/options/index";

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
      dirs: declare(array(directorySchema), {
        description: "Directories the environment is placed on, each covering its subtree, a workspace's included; a built-in environment defaults to its top-level namespace's resolved directories.",
        optional: { value: undefined },
      }),
      files: declare(array(globSchema), {
        description: "Globs, matched at the project root only, of the files the environment is placed on; a built-in environment defaults to its options' `files` when its `dirs` option includes `.`.",
        optional: { value: undefined },
      }),
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
