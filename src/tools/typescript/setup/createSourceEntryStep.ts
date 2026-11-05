import type { ResolvedSource } from "#project/environments/index";
import type { Step } from "#project/steps/index";

export function createSourceEntryStep(): Step<{ src: ResolvedSource }> {
  return {
    name: "source entry",
    message: "Create the source entry of the library?",
    async isMissing({ get, getTraits }) {
      const source = await get("src");

      const traits = await getTraits();

      return traits.published && source.dirs.length > 0 && !source.active;
    },
    async plan({ get, filesystem }) {
      const source = await get("src");

      const [directory] = source.dirs;

      if (directory === undefined) {
        throw new Error("The src environment has no directory");
      }

      await filesystem.write(`${directory}/index.ts`, "export {};\n");
    },
  };
}
