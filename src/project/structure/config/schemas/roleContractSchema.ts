import {
  array,
  boolean,
  description,
  literal,
  number,
  optional,
  picklist,
  pipe,
  readonly,
  strictObject,
  string,
  union,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { globsSchema } from "#config/config/schemas/values/globsSchema";

export const roleContractSchema = pipe(
  strictObject({
    file: optional(
      pipe(
        globsSchema,
        description(
          "Makes the role a file role, matched by these names or globs.",
        ),
      ),
    ),
    accepts: optional(
      pipe(
        globsSchema,
        description(
          "Files a directory role takes, as names or globs. Unset, the role takes the modules of its environment.",
        ),
      ),
    ),
    nesting: optional(
      pipe(
        union([number(), literal("any")]),
        description(
          join(
            [
              "Whether the role nests and how deep: a depth or `any`.",
              "@default `0`, so the role is flat",
            ],
            "\n",
          ),
        ),
      ),
    ),
    roles: optional(
      pipe(
        pipe(array(string()), readonly()),
        description(
          "Structured role: the names of the roles it contains. Scoped roles listed here are active inside it.",
        ),
      ),
    ),
    categories: optional(
      pipe(
        boolean(),
        description(
          "Semi-structured role: it requires category subdirectories whose names are free.",
        ),
      ),
    ),
    exports: optional(
      pipe(
        picklist(["named-match", "named", "default"]),
        description(
          "Export style of its TypeScript and JavaScript modules: one named export matching the file name, named exports, or a default export.",
        ),
      ),
    ),
    index: optional(
      pipe(
        boolean(),
        description(
          join(
            ["Whether an `index` file is allowed.", "@default `false`"],
            "\n",
          ),
        ),
      ),
    ),
    public: optional(
      pipe(
        boolean(),
        description(
          join(
            [
              "Whether its modules are importable one by one from other domains of the project, without going through `index.ts`.",
              "Package exports come only from the domain's visibility.",
              "@default `false`",
            ],
            "\n",
          ),
        ),
      ),
    ),
    discovered: optional(
      pipe(
        boolean(),
        description(
          join(
            [
              "Whether a consumer discovers its files, so they may export defaults.",
              "@default `false`",
            ],
            "\n",
          ),
        ),
      ),
    ),
    scoped: optional(
      pipe(
        boolean(),
        description(
          join(
            [
              "Whether the role is active only where a structured role or a namespace enables it.",
              "@default `false`",
            ],
            "\n",
          ),
        ),
      ),
    ),
  }),
  readonly(),
  description("The contract of a role."),
);
