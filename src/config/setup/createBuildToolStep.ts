import { includes } from "@auaust/primitive-kit/arrays";

import { tsdown, vite } from "#constants";
import { hasConfigFile } from "#support/scaffold/utils/hasConfigFile";
import type { Step } from "#support/scaffold/types/Step";

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
