import { sourceSection } from "#project/config/index";
import type { Step } from "#project/steps/index";

export function createSourceEntryStep(): Step {
  return {
    name: "source entry",
    message: "Create the source entry of the library?",
    async isMissing({ resolve, getTraits }) {
      const source = await resolve(sourceSection);

      const traits = await getTraits();

      return traits.published && source.dirs.length > 0 && !source.active;
    },
    async plan({ resolve, filesystem }) {
      const source = await resolve(sourceSection);

      const [directory] = source.dirs;

      if (directory === undefined) {
        throw new Error("The src environment has no directory");
      }

      await filesystem.write(`${directory}/index.ts`, "export {};\n");
    },
  };
}
