import type { ResolvedSource } from "#project/environments/types/ResolvedSource";
import type { Step } from "#project/steps/types/Step";

export function createSourceEntryStep(): Step<{ src: ResolvedSource }> {
  return {
    name: "source entry",
    message: "Create the source entry of the library?",
    isMissing({ get, getTraits }) {
      return (
        getTraits().published &&
        get("src").dirs.length > 0 &&
        !get("src").active
      );
    },
    plan({ get, filesystem }) {
      const [directory] = get("src").dirs;

      if (directory === undefined) {
        throw new Error("The src environment has no directory");
      }

      filesystem.write(`${directory}/index.ts`, "export {};\n");
    },
  };
}
