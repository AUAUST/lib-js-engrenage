import {
  environmentEntry,
  environmentKindEntry,
  languageEntry,
} from "#project/environments/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `environmentKinds`, `environments` and `languages` slots, the config
 * keys of each built-in environment and its options, `environments.claims`,
 * `define` and `runtime`, the uncommitted coverage directory and the unlinted
 * static directories. Contributes the `src`, `tests`, `bin`, `scripts`, `tooling`,
 * `data` and `static` environment kinds, one environment of each, named after
 * it, and the `javascript` language.
 */
export default {
  name: "project/environments",
  owns: {
    slots: {
      environmentKinds: { entry: environmentKindEntry },
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
      "static": {
        input: "static",
        async load() {
          const {
            staticSection,
          } = await import("#project/environments/config/sections/staticSection");

          return staticSection;
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
    environmentKinds: [
      {
        name: "src",
        level: "enforced",
        code: "published",
        structure: "domains",
        imports: { data: "whole" },
        inward: "open",
        tsconfig: true,
        languages: ["typescript", "tsx"],
      },
      {
        name: "tests",
        level: "enforced",
        code: "private",
        structure: "roles",
        imports: {
          src: "whole",
          bin: "whole",
          scripts: "whole",
          tooling: "whole",
          data: "whole",
        },
        layout: "mirror",
        tsconfig: true,
        languages: ["typescript", "tsx"],
      },
      {
        name: "bin",
        level: "enforced",
        code: "published",
        structure: "roles",
        imports: { src: "surface" },
        inward: "open",
        layout: "commands",
        tsconfig: true,
        languages: ["typescript"],
      },
      {
        name: "scripts",
        level: "enforced",
        code: "private",
        structure: "domains",
        imports: { src: "surface", data: "whole" },
        inward: "open",
        layout: "commands",
        tsconfig: true,
        languages: ["typescript"],
      },
      {
        name: "tooling",
        level: "enforced",
        structure: "domains",
        imports: { src: "surface" },
        inward: "open",
        tsconfig: true,
        languages: ["typescript"],
      },
      {
        name: "data",
        level: "enforced",
        inward: "open",
      },
      {
        name: "static",
        level: "enforced",
      },
    ],
    environments: [
      {
        name: "src",
        kind: "src",
        title: "the src environment's files",
      },
      {
        name: "tests",
        kind: "tests",
        title: "the tests environment's files",
      },
      {
        name: "bin",
        kind: "bin",
        title: "the bin environment's files",
      },
      {
        name: "scripts",
        kind: "scripts",
        title: "the scripts environment's files",
      },
      {
        name: "tooling",
        kind: "tooling",
        title: "the tooling environment's files",
      },
      {
        name: "data",
        kind: "data",
        title: "the data environment's files",
      },
      {
        name: "static",
        kind: "static",
        title: "the static environment's files",
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
