import { packages } from "#constants";
import {
  argument,
  command,
  option,
  type CommandDeclaration,
} from "#nexus/cli/index";
import { defineToolCommand } from "#workflows/cli/index";

import pnpm from "#bin/engrenage/pnpm/index";

const builtins: readonly CommandDeclaration[] = [
  command({
    name: "init",
    description: "Set up engrenage in the project, or add the pieces it is missing.",
    options: [
      option({
        name: "yes",
        type: "boolean",
        short: "y",
        description: "accept every step without asking",
        default: false,
      }),
    ],
    action() {
      return import("#bin/engrenage/actions/init");
    },
  }),
  command({
    name: "sync",
    description: "Update the existing project files that engrenage derives from the config. `engrenage init` creates missing ones.",
    arguments: [
      argument({
        name: "targets",
        description: "targets to sync, plus every fill target (all by default)",
        optional: true,
        variadic: true,
        choices() {
          return import("#bin/engrenage/actions/syncTargets");
        },
      }),
    ],
    options: [
      option({
        name: "check",
        type: "boolean",
        description: "report outdated files without writing them",
        default: false,
      }),
      () => {
        return import("#bin/engrenage/actions/syncOptions");
      },
    ],
    action() {
      return import("#bin/engrenage/actions/sync");
    },
    parse(targets, { check }, { options }) {
      return [targets, { check, values: options }];
    },
  }),
  command({
    name: "gate",
    description: "Fix and check the changed files: ESLint, Prettier, types, structure, sync, related tests and the configured commands; with --all, check the whole project without fixing anything.",
    options: [
      option({
        name: "staged",
        type: "boolean",
        description: "fix and check the staged files, and stage the fixes (default)",
        conflicts: ["worktree"],
      }),
      option({
        name: "worktree",
        type: "boolean",
        description: "fix and check the changes against HEAD and the untracked files",
        conflicts: ["staged"],
      }),
      option({
        name: "everyone",
        type: "boolean",
        description: "run only the fixes and checks every commit must pass, or only the message checks every commit message must pass",
        conflicts: ["worktree"],
      }),
      option({
        name: "message",
        type: "string",
        placeholder: "file",
        description: "check only the commit message stored in a file",
        conflicts: ["staged", "worktree"],
      }),
      option({
        name: "all",
        type: "boolean",
        description: "check the whole project without fixing anything: every step and the configured commands",
        conflicts: ["staged", "worktree", "everyone", "message"],
      }),
    ],
    action() {
      return import("#bin/engrenage/actions/gate");
    },
  }),
  pnpm,
  command({
    name: "link",
    description: "Link a registered repository's installed package to its local checkout without changing tracked files, or list the links with their state.",
    arguments: [
      argument({
        name: "repository",
        description: "registered short name of the repository",
        optional: true,
      }),
      argument({
        name: "directory",
        description: "the repository's local checkout",
        optional: true,
      }),
    ],
    options: [
      option({
        name: "remove",
        type: "string",
        placeholder: "repository",
        description: "restore the installed package of a linked repository",
      }),
      option({
        name: "restore",
        type: "boolean",
        description: "repoint every recorded link at its checkout, after an install",
        default: false,
      }),
    ],
    action() {
      return import("#bin/engrenage/actions/link");
    },
  }),
  defineToolCommand({
    name: "tsc",
    aliases: ["typecheck"],
    description: "Check types of every environment the base tsconfig references (those with `check: true`).",
    packageName: packages.typescript,
    binary: "tsc",
    message: "Typechecking...",
    action() {
      return import("#bin/engrenage/actions/tsc");
    },
  }),
  defineToolCommand({
    name: "tsc:dist",
    aliases: ["typecheck:dist"],
    description: "Check the types of the tests against the build output (the tests.dist tsconfig).",
    packageName: packages.typescript,
    binary: "tsc",
    message: "Checking the types of the build output...",
    action() {
      return import("#bin/engrenage/actions/tscDist");
    },
  }),
  defineToolCommand({
    name: "vitest",
    description: "Run the tests once, with type tests unless --no-typecheck.",
    packageName: packages.vitest,
    message: "Running the tests...",
    action() {
      return import("#bin/engrenage/actions/vitest");
    },
  }),
  defineToolCommand({
    name: "vitest:watch",
    description: "Run the tests in watch mode, with type tests unless --no-typecheck.",
    packageName: packages.vitest,
    action() {
      return import("#bin/engrenage/actions/vitestWatch");
    },
  }),
  defineToolCommand({
    name: "vitest:coverage",
    description: "Run the tests once and report coverage.",
    packageName: packages.vitest,
    message: "Running the tests with coverage...",
    action() {
      return import("#bin/engrenage/actions/vitestCoverage");
    },
  }),
  defineToolCommand({
    name: "vitest:dist",
    description: "Run the tests once against the built output.",
    packageName: packages.vitest,
    message: "Running the tests against the build output...",
    action() {
      return import("#bin/engrenage/actions/vitestDist");
    },
  }),
  defineToolCommand({
    name: "tsdown",
    description: "Build the package, loading the config with tsx.",
    packageName: packages.tsdown,
    action() {
      return import("#bin/engrenage/actions/tsdown");
    },
  }),
  defineToolCommand({
    name: "vite",
    description: "Run Vite.",
    packageName: packages.vite,
  }),
  defineToolCommand({
    name: "eslint",
    aliases: ["lint"],
    description: "Lint the project.",
    packageName: packages.eslint,
    message: "Linting...",
    action() {
      return import("#bin/engrenage/actions/eslint");
    },
  }),
  defineToolCommand({
    name: "eslint:fix",
    aliases: ["lint:fix"],
    description: "Fix lint errors and prune unused suppressions.",
    packageName: packages.eslint,
    message: "Fixing lint errors...",
    root: true,
    action() {
      return import("#bin/engrenage/actions/eslintFix");
    },
  }),
  defineToolCommand({
    name: "eslint:suppress",
    aliases: ["lint:suppress"],
    description: "Suppress the remaining lint errors.",
    packageName: packages.eslint,
    message: "Suppressing lint errors...",
    root: true,
    action() {
      return import("#bin/engrenage/actions/eslintSuppress");
    },
  }),
  defineToolCommand({
    name: "jscpd",
    description: "Detect duplicated code in the project's code files, outside tests, fixtures and generated files.",
    packageName: packages.jscpd,
    message: "Detecting duplicated code...",
    action() {
      return import("#bin/engrenage/actions/jscpd");
    },
  }),
  command({
    name: "jscpd:new",
    description: "List by name the clones added since a git ref.",
    arguments: [
      argument({
        name: "ref",
        description: "git ref the clones are compared with",
      }),
    ],
    action() {
      return import("#bin/engrenage/actions/jscpdNew");
    },
  }),
  defineToolCommand({
    name: "prettier",
    aliases: ["format"],
    description: "Format the given files.",
    packageName: packages.prettier,
    action() {
      return import("#bin/engrenage/actions/prettier");
    },
  }),
  defineToolCommand({
    name: "prettier:check",
    description: "Check the formatting of the given files.",
    packageName: packages.prettier,
    message: "Checking formatting...",
    action() {
      return import("#bin/engrenage/actions/prettierCheck");
    },
  }),
  defineToolCommand({
    name: "prettier:all",
    aliases: ["format:all"],
    description: "Format the whole project.",
    packageName: packages.prettier,
    action() {
      return import("#bin/engrenage/actions/prettierAll");
    },
  }),
];

export default builtins;
