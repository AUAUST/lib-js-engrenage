import {
  array,
  boolean,
  literal,
  number,
  picklist,
  pipe,
  readonly,
  string,
  union,
} from "valibot";

import { globsSchema } from "#config/config/schemas/values/globsSchema";
import { declare } from "#options/utils/declare";
import { declareObject } from "#options/utils/declareObject";
import { unset } from "#options/utils/unset";

export const roleContractSchema = declareObject(
  {
    file: declare(globsSchema, {
      description:
        "Makes the role a file role, matched by these names or globs.",
      optional: { value: undefined },
    }),
    accepts: declare(globsSchema, {
      description: "Files a directory role takes, as names or globs.",
      optional: unset("the modules of its environment"),
    }),
    nesting: declare(union([number(), literal("any")]), {
      description: "Whether the role nests and how deep: a depth or `any`.",
      optional: {
        explain: "`0`, so the role is flat",
        compute() {
          return 0;
        },
      },
    }),
    roles: declare(pipe(array(string()), readonly()), {
      description:
        "Structured role: the names of the roles it contains. Scoped roles listed here are active inside it.",
      optional: { value: undefined },
    }),
    categories: declare(boolean(), {
      description:
        "Semi-structured role: it requires category subdirectories whose names are free.",
      optional: { value: undefined },
    }),
    exports: declare(picklist(["named-match", "named", "default"]), {
      description:
        "Export style of its TypeScript and JavaScript modules: one named export matching the file name, named exports, or a default export.",
      optional: { value: undefined },
    }),
    index: declare(boolean(), {
      description: "Whether an `index` file is allowed.",
      optional: { value: false },
    }),
    public: declare(boolean(), {
      description: [
        "Whether its modules are importable one by one from other domains of the project, without going through `index.ts`.",
        "Package exports come only from the domain's visibility.",
      ],
      optional: { value: false },
    }),
    discovered: declare(boolean(), {
      description:
        "Whether a consumer discovers its files, so they may export defaults.",
      optional: { value: false },
    }),
    scoped: declare(boolean(), {
      description:
        "Whether the role is active only where a structured role or a namespace enables it.",
      optional: { value: false },
    }),
  },
  {
    description: "The contract of a role.",
  },
);
