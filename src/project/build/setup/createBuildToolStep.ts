import { includes } from "@auaust/primitive-kit/arrays";

// @debt reaches into workflows/cli, a higher layer than project; the layered registry (#143) removes the upward dependency
import { tsdown, vite } from "#constants";
import { hasConfigFile } from "#workflows/cli/operations/hasConfigFile";
// @debt reaches into workflows/cli, a higher layer than project; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";

export function createBuildToolStep(): Step {
  return {
    name: "build tool",
    isMissing({ config, filesystem, hasDependency }) {
      return (
        config.configFile === undefined &&
        [tsdown, vite].every((tool) => {
          return !hasDependency(tool) && !hasConfigFile(filesystem, tool);
        })
      );
    },
    async plan({ select, getPresets, addDevDependency }) {
      const buildTool = await select(
        "Which build tool?",
        [tsdown, vite, "none"],
        includes(getPresets(), "library") ? tsdown : "none",
      );

      if (buildTool !== "none") {
        addDevDependency(buildTool);
      }
    },
  };
}
