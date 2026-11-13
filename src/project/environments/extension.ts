import {
  environmentEntry,
  languageEntry,
} from "#project/environments/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `environments` and `languages` slots, the config keys of each built-in
 * environment and its options, `environments.claims`, `define` and `runtime`,
 * and the uncommitted coverage directory. Contributes the `src`, `tests`, `bin`,
 * `scripts`, `tooling` and `data` environments and the `javascript` language.
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
        async load() {
          const {
            environmentsSection,
          } = await import("#project/environments/config/sections/environmentsSection");

          return environmentsSection;
        },
      },
      "environments.claims": {
        async load() {
          const {
            environmentClaimsSection,
          } = await import("#project/environments/config/sections/environmentClaimsSection");

          return environmentClaimsSection;
        },
      },
      "bin": {
        async load() {
          const {
            binSection,
          } = await import("#project/environments/config/sections/binSection");

          return binSection;
        },
      },
      "bin.options": {
        input: "bin",
        async load() {
          const {
            binOptionsSection,
          } = await import("#project/environments/config/sections/binOptionsSection");

          return binOptionsSection;
        },
      },
      "scripts": {
        async load() {
          const {
            scriptsSection,
          } = await import("#project/environments/config/sections/scriptsSection");

          return scriptsSection;
        },
      },
      "scripts.options": {
        input: "scripts",
        async load() {
          const {
            scriptsOptionsSection,
          } = await import("#project/environments/config/sections/scriptsOptionsSection");

          return scriptsOptionsSection;
        },
      },
      "src": {
        async load() {
          const {
            sourceSection,
          } = await import("#project/environments/config/sections/sourceSection");

          return sourceSection;
        },
      },
      "src.options": {
        input: "src",
        async load() {
          const {
            sourceOptionsSection,
          } = await import("#project/environments/config/sections/sourceOptionsSection");

          return sourceOptionsSection;
        },
      },
      "tests": {
        async load() {
          const {
            testsSection,
          } = await import("#project/environments/config/sections/testsSection");

          return testsSection;
        },
      },
      "tests.options": {
        input: "tests",
        async load() {
          const {
            testsOptionsSection,
          } = await import("#project/environments/config/sections/testsOptionsSection");

          return testsOptionsSection;
        },
      },
      "tooling": {
        async load() {
          const {
            toolingSection,
          } = await import("#project/environments/config/sections/toolingSection");

          return toolingSection;
        },
      },
      "tooling.options": {
        input: "tooling",
        async load() {
          const {
            toolingOptionsSection,
          } = await import("#project/environments/config/sections/toolingOptionsSection");

          return toolingOptionsSection;
        },
      },
      "data": {
        input: "data",
        async load() {
          const {
            dataSection,
          } = await import("#project/environments/config/sections/dataSection");

          return dataSection;
        },
      },
      "define": {
        input: "define",
        async load() {
          const {
            defineSection,
          } = await import("#project/environments/config/sections/defineSection");

          return defineSection;
        },
      },
      "runtime": {
        input: "runtime",
        async load() {
          const {
            runtimeSection,
          } = await import("#project/environments/config/sections/runtimeSection");

          return runtimeSection;
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
    }
  }
}
