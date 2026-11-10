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

import {
  declare,
  describeDefault,
  globsSchema,
  unset,
} from "#foundation/options/index";
import { roleFileResolverSchema } from "#project/roles/config/schemas/roleFileResolverSchema";
import { roleRulesSchema } from "#project/roles/config/schemas/roleRulesSchema";
import { roleContractDefaults } from "#project/roles/constants";

function describedDefault(value: unknown) {
  return unset(describeDefault({ value }));
}

export function declareRoleContractEntries<Nested>(
  nested: GenericSchema<Nested>,
) {
  return {
    purpose: declare(string(), {
      description: "One line stating what the role holds.",
      optional: { value: undefined },
    }),
    file: declare(union([globsSchema, roleFileResolverSchema]), {
      description: "Makes the role a file role, matched by these names or globs, or by those a callback returns for each owning location; a nested role's also match files at its owner's root.",
      optional: { value: undefined },
    }),
    fileDescription: declare(string(), {
      description: "How a `file` callback names the role's files, shown in maps instead of globs.",
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
    roles: declare(pipe(array(nested), readonly()), {
      description: "Structured role: the roles it contains, each registered as `<owner>/<name>`, active inside it only and shadowing a root role of the same name there.",
      optional: { value: undefined },
    }),
    categories: declare(boolean(), {
      description: "Semi-structured role: it requires category subdirectories whose names are free.",
      optional: { value: undefined },
    }),
    exports: declare(picklist(["named-match", "named", "default"]), {
      description: "Export style of its TypeScript and JavaScript modules: one named export matching the file name, named exports, or a default export.",
      optional: { value: undefined },
    }),
    index: declare(boolean(), {
      description: "Whether a file named like the environment's index file is the role's barrel, re-exporting its modules; otherwise that file is an ordinary module of the role.",
      optional: describedDefault(roleContractDefaults.index),
    }),
    public: declare(boolean(), {
      description: [
        "Whether its modules are importable one by one from other domains of the project, without going through `index.ts`.",
        "Package exports come only from the domain's visibility.",
      ],
      optional: describedDefault(roleContractDefaults.public),
    }),
    collected: declare(boolean(), {
      description: "Whether its public modules stay importable inside sub-domains, without going through their parent domains' surfaces, so one module can collect them all.",
      optional: describedDefault(roleContractDefaults.collected),
    }),
    typeOnly: declare(boolean(), {
      description: "Whether its modules declare and export no runtime value and import only through top-level `import type`, from anything their domain may import and its own modules. Needs `typescript.verbatimModuleSyntax`.",
      optional: describedDefault(roleContractDefaults.typeOnly),
    }),
    aliases: declare(pipe(array(string()), readonly()), {
      description: "Directory names read as this role (`helpers` read as `utils`).",
      optional: { value: undefined },
    }),
    effects: declare(string(), {
      description: (
        "The effect level of the role, a name of `structure.effects.levels`. " +
        "A module of a ranked role imports at runtime only bindings declared in roles of its level or purer, " +
        "and external modules ranked likewise; an unranked role imports anything and is imported at runtime only by unranked roles. " +
        "Type-only imports are exempt."
      ),
      optional: { value: undefined },
    }),
    discovered: declare(boolean(), {
      description: "Whether a consumer discovers its files, so they may export defaults.",
      optional: describedDefault(roleContractDefaults.discovered),
    }),
    scoped: declare(boolean(), {
      description: "Whether the role is active only where a structured role or a namespace enables it.",
      optional: describedDefault(roleContractDefaults.scoped),
    }),
    strict: declare(boolean(), {
      description: "Accepts at its root only the files its nested roles' `file` globs name, besides their directories.",
      optional: describedDefault(roleContractDefaults.strict),
    }),
    unique: declare(boolean(), {
      description: "Holds at most one file per owning location, across its `file` globs and accepted files.",
      optional: describedDefault(roleContractDefaults.unique),
    }),
    required: declare(boolean(), {
      description: "Holds at least one file in each owning location: each domain where it is active, each directory of its owner role for a nested file role, each of its directories for a directory role.",
      optional: describedDefault(roleContractDefaults.required),
    }),
    rules: declare(roleRulesSchema, {
      description: [
        "ESLint rules applied to the role's files only, never to the files of its nested roles.",
        "Each value is a rule entry for a rule already registered, or a rule module, registered as `roles/<role>/<key>` and reported as errors.",
      ],
      optional: { value: undefined },
    }),
  };
}
