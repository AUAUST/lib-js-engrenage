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
  type GenericSchema,
} from "valibot";

import { globsSchema } from "#foundation/options/config/schemas/globsSchema";
import { describeDefault } from "#foundation/options/index";
import { declare } from "#foundation/options/utils/declare";
import { unset } from "#foundation/options/utils/unset";
import { roleContractDefaults } from "#project/structure/constants";

function inherited(value: unknown) {
  return unset(describeDefault({ value }));
}

export function declareRoleContractEntries<Inline>(
  inline: GenericSchema<Inline>,
) {
  return {
    inherit: declare(string(), {
      description:
        "The role whose contract the given fields are merged over: a root name or a qualified `<owner>/<name>`, read as written. A role inheriting its own name takes the role of the previous layer (catalogue, project, environment). Given fields replace inherited ones, `roles` included.",
      optional: { value: undefined },
    }),
    purpose: declare(string(), {
      description: "One line stating what the role holds.",
      optional: { value: undefined },
    }),
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
      optional: unset(
        `${describeDefault({ value: roleContractDefaults.nesting })}, so the role is flat`,
      ),
    }),
    roles: declare(pipe(array(union([string(), inline])), readonly()), {
      description:
        "Structured role: the roles it contains, each a registered name or an inline contract with its `name`. Scoped roles listed here are active inside it, and an inline role shadows a root role of the same name inside it only.",
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
      optional: inherited(roleContractDefaults.index),
    }),
    public: declare(boolean(), {
      description: [
        "Whether its modules are importable one by one from other domains of the project, without going through `index.ts`.",
        "Package exports come only from the domain's visibility.",
      ],
      optional: inherited(roleContractDefaults.public),
    }),
    typeOnly: declare(boolean(), {
      description:
        "Whether its modules declare and export no runtime value and import only through top-level `import type`, from anything their domain may import and its own modules. Needs `typescript.verbatimModuleSyntax`.",
      optional: inherited(roleContractDefaults.typeOnly),
    }),
    discovered: declare(boolean(), {
      description:
        "Whether a consumer discovers its files, so they may export defaults.",
      optional: inherited(roleContractDefaults.discovered),
    }),
    scoped: declare(boolean(), {
      description:
        "Whether the role is active only where a structured role or a namespace enables it.",
      optional: inherited(roleContractDefaults.scoped),
    }),
  };
}
