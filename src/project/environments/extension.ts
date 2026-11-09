import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "project/environments",
  owns: {
    keys: {
      "bin": {
        async load() {
          const { binSection } =
            await import("#project/environments/config/sections/binSection");

          return binSection;
        },
      },
      "bin.options": {
        input: "bin",
        async load() {
          const { binOptionsSection } =
            await import("#project/environments/config/sections/binOptionsSection");

          return binOptionsSection;
        },
      },
      "scripts": {
        async load() {
          const { scriptsSection } =
            await import("#project/environments/config/sections/scriptsSection");

          return scriptsSection;
        },
      },
      "scripts.options": {
        input: "scripts",
        async load() {
          const { scriptsOptionsSection } =
            await import("#project/environments/config/sections/scriptsOptionsSection");

          return scriptsOptionsSection;
        },
      },
      "src": {
        async load() {
          const { sourceSection } =
            await import("#project/environments/config/sections/sourceSection");

          return sourceSection;
        },
      },
      "src.options": {
        input: "src",
        async load() {
          const { sourceOptionsSection } =
            await import("#project/environments/config/sections/sourceOptionsSection");

          return sourceOptionsSection;
        },
      },
      "tests": {
        async load() {
          const { testsSection } =
            await import("#project/environments/config/sections/testsSection");

          return testsSection;
        },
      },
      "tests.options": {
        input: "tests",
        async load() {
          const { testsOptionsSection } =
            await import("#project/environments/config/sections/testsOptionsSection");

          return testsOptionsSection;
        },
      },
      "tooling": {
        async load() {
          const { toolingSection } =
            await import("#project/environments/config/sections/toolingSection");

          return toolingSection;
        },
      },
      "tooling.options": {
        input: "tooling",
        async load() {
          const { toolingOptionsSection } =
            await import("#project/environments/config/sections/toolingOptionsSection");

          return toolingOptionsSection;
        },
      },
      "data": {
        input: "data",
        async load() {
          const { dataSection } =
            await import("#project/environments/config/sections/dataSection");

          return dataSection;
        },
      },
      "define": {
        input: "define",
        async load() {
          const { defineSection } =
            await import("#project/environments/config/sections/defineSection");

          return defineSection;
        },
      },
      "runtime": {
        input: "runtime",
        async load() {
          const { runtimeSection } =
            await import("#project/environments/config/sections/runtimeSection");

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
} satisfies Extension;
