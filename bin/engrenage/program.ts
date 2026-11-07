// @debt The `auaust/no-dynamic-import` rule forbids the dynamic imports that load each subcommand only when it runs, so the rule is disabled here until it allows lazy command loading (#221).
/* eslint-disable auaust/no-dynamic-import */

import { Command } from "@commander-js/extra-typings";

import { addDebugOption } from "#workflows/cli/operations/addDebugOption";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";
import { runProgram } from "#workflows/cli/operations/runProgram";

import packageJson from "#package.json" with { type: "json" };

export const program = registerLazySubcommands(
  new Command("engrenage")
    .description(packageJson.description)
    .version(packageJson.version)
    .enablePositionalOptions(),
  {
    "init": {
      description:
        "Set up engrenage in the project, or add the pieces it is missing.",
      async load() {
        const { init } = await import("#bin/engrenage/init");

        return init;
      },
    },
    "sync": {
      description:
        "Update the existing project files that engrenage derives from the config. `engrenage init` creates missing ones.",
      async load() {
        const { sync } = await import("#bin/engrenage/sync");

        return sync;
      },
    },
    "structure": {
      description: "Print how engrenage classifies the project directories.",
      async load() {
        const { structure } = await import("#bin/engrenage/structure");

        return structure;
      },
    },
    "gate": {
      description:
        "Fix and check the changed files: ESLint, Prettier, types, structure, sync, related tests and the configured commands.",
      async load() {
        const { gate } = await import("#bin/engrenage/gate");

        return gate;
      },
    },
    "issues": {
      description: "Check GitHub issues against the issue contract.",
      async load() {
        const { issues } = await import("#bin/engrenage/issues");

        return issues;
      },
    },
    "debt": {
      description: "List the @debt markers of the project.",
      async load() {
        const { debt } = await import("#bin/engrenage/debt");

        return debt;
      },
    },
    "agents": {
      description: "Integrate project tools with coding agents.",
      async load() {
        const { agents } = await import("#bin/engrenage/agents/index");

        return agents;
      },
    },
    "pnpm": {
      description: "Manage the pnpm version of the project.",
      async load() {
        const { pnpm } = await import("#bin/engrenage/pnpm/index");

        return pnpm;
      },
    },
    "tsc": {
      description:
        "Check types of every environment the base tsconfig references (those with `check: true`).",
      aliases: ["typecheck"],
      async load() {
        const { tsc } = await import("#bin/engrenage/tsc");

        return tsc.tsc;
      },
    },
    "tsc:dist": {
      description:
        "Check the types of the tests against the build output (the tests.dist tsconfig).",
      aliases: ["typecheck:dist"],
      async load() {
        const { tsc } = await import("#bin/engrenage/tsc");

        return tsc["tsc:dist"];
      },
    },
    "vitest": {
      description: "Run the tests once, with type tests unless --no-typecheck.",
      async load() {
        const { vitest } = await import("#bin/engrenage/vitest");

        return vitest.vitest;
      },
    },
    "vitest:watch": {
      description:
        "Run the tests in watch mode, with type tests unless --no-typecheck.",
      async load() {
        const { vitest } = await import("#bin/engrenage/vitest");

        return vitest["vitest:watch"];
      },
    },
    "vitest:coverage": {
      description: "Run the tests once and report coverage.",
      async load() {
        const { vitest } = await import("#bin/engrenage/vitest");

        return vitest["vitest:coverage"];
      },
    },
    "vitest:dist": {
      description: "Run the tests once against the built output.",
      async load() {
        const { vitest } = await import("#bin/engrenage/vitest");

        return vitest["vitest:dist"];
      },
    },
    "tsdown": {
      description: "Build the package, loading the config with tsx.",
      async load() {
        const { tsdown } = await import("#bin/engrenage/tsdown");

        return tsdown.tsdown;
      },
    },
    "vite": {
      description: "Run Vite.",
      async load() {
        const { vite } = await import("#bin/engrenage/vite");

        return vite.vite;
      },
    },
    "eslint": {
      description: "Lint the project, caching results in node_modules.",
      aliases: ["lint"],
      async load() {
        const { eslint } = await import("#bin/engrenage/eslint");

        return eslint.eslint;
      },
    },
    "eslint:fix": {
      description: "Fix lint errors and prune unused suppressions.",
      aliases: ["lint:fix"],
      async load() {
        const { eslint } = await import("#bin/engrenage/eslint");

        return eslint["eslint:fix"];
      },
    },
    "eslint:suppress": {
      description: "Suppress the remaining lint errors.",
      aliases: ["lint:suppress"],
      async load() {
        const { eslint } = await import("#bin/engrenage/eslint");

        return eslint["eslint:suppress"];
      },
    },
    "jscpd": {
      description:
        "Detect duplicated code in the project's code files, outside tests, fixtures and generated files.",
      async load() {
        const { jscpd } = await import("#bin/engrenage/jscpd");

        return jscpd.jscpd;
      },
    },
    "prettier": {
      description: "Format the given files.",
      aliases: ["format"],
      async load() {
        const { prettier } = await import("#bin/engrenage/prettier");

        return prettier.prettier;
      },
    },
    "prettier:check": {
      description: "Check the formatting of the given files.",
      async load() {
        const { prettier } = await import("#bin/engrenage/prettier");

        return prettier["prettier:check"];
      },
    },
    "prettier:all": {
      description: "Format the whole project.",
      aliases: ["format:all"],
      async load() {
        const { prettier } = await import("#bin/engrenage/prettier");

        return prettier["prettier:all"];
      },
    },
  },
);

addDebugOption(program);

export function run() {
  return runProgram(program);
}
