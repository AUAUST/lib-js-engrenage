import {
  builtinEnvironmentPresets,
  environmentEntry,
  environmentPresetEntry,
  languageEntry,
  namespaceKindEntry,
  testsNamespaceKind,
} from "#project/environments/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `namespaceKinds`, `environmentPresets`, `environments` and
 * `languages` slots, the config keys of each built-in environment and its
 * options, `environments`, `environments.claims`, `environments.execution`,
 * `environments.tsconfig`, `define` and `runtime`, the uncommitted coverage
 * directory and the unlinted static directories. Contributes the `src`, `tests`,
 * `bin`, `scripts`, `tooling`, `data` and `static` namespace kinds and environment
 * presets, one environment of each, named after it, and the `javascript` language.
 */
export default {
  name: "project/environments",
  owns: {
    slots: {
      namespaceKinds: { entry: namespaceKindEntry },
      environmentPresets: { entry: environmentPresetEntry },
      environments: { entry: environmentEntry },
      languages: { entry: languageEntry },
    },
    keys: {
      "environments": {
        input: "environments",
        async load() {
          const {
            environmentsSection,
          } = await import("#project/environments/config/sections/environmentsSection");

          return environmentsSection;
        },
      },
      "environments.tsconfig": {
        input: "environments",
        async load() {
          const {
            environmentTsconfigsSection,
          } = await import("#project/environments/config/sections/environmentTsconfigsSection");

          return environmentTsconfigsSection;
        },
      },
      "environments.execution": {
        async load() {
          const {
            executionSection,
          } = await import("#project/environments/config/sections/executionSection");

          return executionSection;
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
        async load() {
          const {
            dataSection,
          } = await import("#project/environments/config/sections/dataSection");

          return dataSection;
        },
      },
      "data.options": {
        input: "data",
        async load() {
          const {
            dataOptionsSection,
          } = await import("#project/environments/config/sections/dataOptionsSection");

          return dataOptionsSection;
        },
      },
      "static": {
        async load() {
          const {
            staticSection,
          } = await import("#project/environments/config/sections/staticSection");

          return staticSection;
        },
      },
      "static.options": {
        input: "static",
        async load() {
          const {
            staticOptionsSection,
          } = await import("#project/environments/config/sections/staticOptionsSection");

          return staticOptionsSection;
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
    namespaceKinds: [
      {
        name: "src",
        level: "enforced",
        structure: "domains",
        code: "published",
        imports: { data: "whole" },
        inward: "open",
        entries: true,
      },
      testsNamespaceKind,
      {
        name: "bin",
        level: "enforced",
        structure: "roles",
        layout: "commands",
        code: "published",
        imports: { src: "surface" },
        inward: "open",
      },
      {
        name: "scripts",
        level: "enforced",
        structure: "domains",
        layout: "commands",
        code: "private",
        imports: { src: "surface", data: "whole" },
        inward: "open",
      },
      {
        name: "tooling",
        level: "enforced",
        structure: "domains",
        imports: { src: "surface" },
        inward: "open",
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
    environmentPresets: builtinEnvironmentPresets,
    environments: [
      {
        name: "src",
        title: "the src environment's files",
      },
      {
        name: "tests",
        title: "the tests environment's files",
      },
      {
        name: "bin",
        title: "the bin environment's files",
      },
      {
        name: "scripts",
        title: "the scripts environment's files",
      },
      {
        name: "tooling",
        title: "the tooling environment's files",
      },
      {
        name: "data",
        title: "the data environment's files",
      },
      {
        name: "static",
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
