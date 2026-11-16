import {
  environmentEntry,
  languageEntry,
} from "#project/environments/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `environments` and `languages` slots, the config keys of each built-in
 * environment and its options, `environments.claims`, `define` and `runtime`,
 * the uncommitted coverage directory and the unlinted static directories.
 * Contributes the `src`, `tests`, `bin`, `scripts`, `tooling`, `data` and `static`
 * environments and the `javascript` language.
 */
export default {
  name: "project/environments",
  owns: {
    slots: {
      environments: { entry: environmentEntry },
      languages: { entry: languageEntry },
    },
    keys: {
      "environments": {
        load() {
          return import("#project/environments/config/sections/environmentsSection");
        },
      },
      "environments.claims": {
        load() {
          return import("#project/environments/config/sections/environmentClaimsSection");
        },
      },
      "bin": {
        load() {
          return import("#project/environments/config/sections/binSection");
        },
      },
      "bin.options": {
        input: "bin",
        load() {
          return import("#project/environments/config/sections/binOptionsSection");
        },
      },
      "scripts": {
        load() {
          return import("#project/environments/config/sections/scriptsSection");
        },
      },
      "scripts.options": {
        input: "scripts",
        load() {
          return import("#project/environments/config/sections/scriptsOptionsSection");
        },
      },
      "src": {
        load() {
          return import("#project/environments/config/sections/sourceSection");
        },
      },
      "src.options": {
        input: "src",
        load() {
          return import("#project/environments/config/sections/sourceOptionsSection");
        },
      },
      "tests": {
        load() {
          return import("#project/environments/config/sections/testsSection");
        },
      },
      "tests.options": {
        input: "tests",
        load() {
          return import("#project/environments/config/sections/testsOptionsSection");
        },
      },
      "tooling": {
        load() {
          return import("#project/environments/config/sections/toolingSection");
        },
      },
      "tooling.options": {
        input: "tooling",
        load() {
          return import("#project/environments/config/sections/toolingOptionsSection");
        },
      },
      "data": {
        input: "data",
        load() {
          return import("#project/environments/config/sections/dataSection");
        },
      },
      "static": {
        input: "static",
        load() {
          return import("#project/environments/config/sections/staticSection");
        },
      },
      "define": {
        input: "define",
        load() {
          return import("#project/environments/config/sections/defineSection");
        },
      },
      "runtime": {
        input: "runtime",
        load() {
          return import("#project/environments/config/sections/runtimeSection");
        },
      },
    },
    files: {
      coverage: {
        title: "Coverage",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const { coverageDir } = await config.resolve("tests");

          return { directory: coverageDir };
        },
      },
      static: {
        title: "Static files",
        linted: false,
        async locate(config): Promise<FileLocation | undefined> {
          const { active, dirs } = await config.resolve("static");

          if (!active) {
            return;
          }

          return {
            globs: dirs.map((directory) => {
              return `${directory}/**`;
            }),
          };
        },
      },
    },
  },
  contributes: {
    environments: [
      {
        name: "src",
        title: "the src environment's files",
        level: "enforced",
        code: "published",
        structure: "domains",
        tsconfig: true,
      },
      {
        name: "tests",
        title: "the tests environment's files",
        level: "enforced",
        code: "private",
        structure: "roles",
        imports: ["bin", "scripts", "data", "tooling"],
        tsconfig: true,
      },
      {
        name: "bin",
        title: "the bin environment's files",
        level: "enforced",
        code: "published",
        structure: "roles",
        consumesSource: true,
        tsconfig: true,
      },
      {
        name: "scripts",
        title: "the scripts environment's files",
        level: "enforced",
        code: "private",
        structure: "domains",
        consumesSource: true,
        imports: ["data"],
        tsconfig: true,
      },
      {
        name: "tooling",
        title: "the tooling environment's files",
        level: "enforced",
        structure: "domains",
        consumesSource: true,
        tsconfig: true,
      },
      {
        name: "data",
        title: "the data environment's files",
        level: "enforced",
      },
      {
        name: "static",
        title: "the static environment's files",
        level: "enforced",
      },
    ],
    languages: [
      {
        name: "javascript",
        extensions: [".js", ".mjs", ".cjs"],
        modules: true,
      },
    ],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface Environments {
      src: true;
      tests: true;
      bin: true;
      scripts: true;
      tooling: true;
      data: true;
      static: true;
    }
  }
}
