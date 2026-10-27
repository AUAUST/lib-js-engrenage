import { includes } from "@auaust/primitive-kit/arrays";

import { engrenage, tsdown, typescript } from "#constants";
import { createConfigModule } from "#support/scaffold/utils/createConfigModule";
import { hasConfigFile } from "#support/scaffold/utils/hasConfigFile";
import type { Step } from "#support/scaffold/types/Step";

export function createTsdownConfigStep(): Step {
  const file = `${tsdown}.config.ts`;

  return {
    name: file,
    message: "Build the library with tsdown?",
    isMissing({ filesystem, getPresets }) {
      return (
        includes(getPresets(), "library") &&
        !filesystem.exists(file) &&
        !hasConfigFile(filesystem, tsdown)
      );
    },
    plan({ filesystem, addDevDependency }) {
      filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/tsdown`,
          definer: "defineTsdownConfig",
        }),
      );

      addDevDependency(tsdown);

      addDevDependency(typescript);
    },
  };
}
