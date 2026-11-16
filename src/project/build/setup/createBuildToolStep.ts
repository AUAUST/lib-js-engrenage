import { tsdown, vite } from "#constants";
import { readPreferredEntry } from "#project/presets/index";
import { hasConfigFile, type Step } from "#project/steps/index";

// @debt the build tools are listed by hand instead of read from the contributions to `build.tools`
export function createBuildToolStep(): Step {
  return {
    name: "build tool",
    async isMissing({ context, filesystem, hasDependency }) {
      if (context.configFile !== undefined) {
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
    async plan({ select, resolve, addDevDependency }) {
      const buildTool = await select(
        "Which build tool?",
        [tsdown, vite, "none"],
        readPreferredEntry(await resolve("preset"), "build.tools") ?? "none",
      );

      if (buildTool !== "none") {
        await addDevDependency(buildTool);
      }
    },
  };
}
