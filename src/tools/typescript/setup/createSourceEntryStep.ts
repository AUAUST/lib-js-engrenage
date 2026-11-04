import { includes } from "@auaust/primitive-kit/arrays";

import type { Step } from "#project/steps/types/Step";

export function createSourceEntryStep(): Step {
  return {
    name: "source entry",
    message: "Create the source entry of the library?",
    isMissing({ config, getPresets }) {
      return (
        includes(getPresets(), "library") &&
        config.src.dirs.length > 0 &&
        !config.src.active
      );
    },
    plan({ config, filesystem }) {
      const [directory] = config.src.dirs;

      if (directory === undefined) {
        throw new Error("The src environment has no directory");
      }

      filesystem.write(`${directory}/index.ts`, "export {};\n");
    },
  };
}
