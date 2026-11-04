import { includes } from "@auaust/primitive-kit/arrays";

import { tsdown, vite } from "#constants";
import { hasConfigFile } from "#project/steps/utils/hasConfigFile";
import type { Step } from "#project/steps/types/Step";
import type { File } from "#types/File";

export function createBuildToolStep(): Step<{ configFile: File | undefined }> {
  return {
    name: "build tool",
    isMissing({ get, filesystem, hasDependency }) {
      return (
        get("configFile") === undefined &&
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
