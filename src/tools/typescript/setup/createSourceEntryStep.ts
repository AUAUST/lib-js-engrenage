import { includes } from "@auaust/primitive-kit/arrays";

// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";

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
