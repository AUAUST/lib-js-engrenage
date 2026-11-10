import { boolean, string } from "valibot";

import {
  declare,
  declareObject,
  declareRecord,
} from "#foundation/options/index";

export const aliasesSchema = declareObject(
  {
    generated: declare(boolean(), {
      description: "Whether the aliases derived from the project structure are generated. `false` with `define` replaces the generated set.",
      optional: { value: true },
    }),
    define: declareRecord(string(), declare(string()), {
      description: "Aliases to add, mapped to their target. A key not starting with `#` is a bundler alias, valid only with `src.bundled`.",
      optional: {
        value: {},
      },
    }),
  },
  {
    description: [
      "Aliases generated into `package.json#imports` (and, for bundled sources, the tsconfig `paths`) by `engrenage sync`, in one flat `#` namespace.",
      "`false` turns them off.",
    ],
    optional: true,
    disable: {
      value: {
        generated: false,
        define: {},
      },
    },
  },
);
