import { string } from "valibot";

import {
  declare,
  declareObject,
  declareRecord,
  globsSchema,
} from "#foundation/options/index";

export const generatorsSchema = declareRecord(
  string(),
  declareObject(
    {
      command: declare(string(), {
        description: "Shell command producing the generator's outputs, run in the scope's directory.",
      }),
      inputs: declare(globsSchema, {
        description: "Globs, inside the scope, of the files the generator reads: a change, deletion or rename of a file they match runs it in the gate.",
      }),
      outputs: declare(globsSchema, {
        description: [
          "Globs, inside the scope, of the files the generator writes, handled as `src.generated` is.",
          "An output glob matching no file runs the generator in the gate.",
        ],
      }),
    },
    {
      description: "One code generator: its command and the files it reads and writes.",
    },
  ),
  {
    description: [
      "Code generators of the scope by name, run in declaration order before the gate's steps.",
      "The gate runs a generator when the changes touch its inputs or one of its outputs is missing, restaging the tracked outputs it changes in a staged run; `gate --all` runs every one and fails when one changes, adds or removes an output Git does not ignore.",
    ],
    optional: {
      value: {},
    },
  },
);
