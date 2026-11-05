import { tsdown, vite } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";
import type { File } from "#types/File";

export function createBuildToolStep(): Step<{ configFile: File | undefined }> {
  return {
    name: "build tool",
    async isMissing({ get, filesystem, hasDependency }) {
      if ((await get("configFile")) !== undefined) {
        return false;
      }

      for (const tool of [tsdown, vite]) {
        if (
          (await hasDependency(tool)) ||
          (await hasConfigFile(filesystem, tool))
        ) {
          return false;
        }
      }

      return true;
    },
    async plan({ select, getTraits, addDevDependency }) {
      const traits = await getTraits();

      const buildTool = await select(
        "Which build tool?",
        [tsdown, vite, "none"],
        traits.published ? tsdown : "none",
      );

      if (buildTool !== "none") {
        await addDevDependency(buildTool);
      }
    },
  };
}
