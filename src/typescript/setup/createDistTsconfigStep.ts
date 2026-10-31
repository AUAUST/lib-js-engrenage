import { includes } from "@auaust/primitive-kit/arrays";

import { engrenage } from "#constants";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { emptyObjectFile } from "#support/json/constants";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import type { Step } from "#support/scaffold/types/Step";

export function createDistTsconfigStep(): Step {
  return {
    name: "tsconfig.tests.dist.json",
    message: "Create the dist tsconfig to check the types of the build output?",
    isMissing({ config, filesystem, getPresets }) {
      const { file } = config.tests.dist.tsconfig;

      return (
        includes(getPresets(), "library") &&
        file !== undefined &&
        config.typescript.tsconfig.path !== undefined &&
        !filesystem.exists(file)
      );
    },
    plan({ config, filesystem }) {
      const { root } = config;
      const { file } = config.tests.dist.tsconfig;

      if (file === undefined) {
        throw new Error(
          "The dist tsconfig is disabled in the engrenage config",
        );
      }

      const tsconfigPath = config.typescript.tsconfig.path;

      if (tsconfigPath === undefined) {
        throw new Error(`No tsconfig found in ${root} to extend`);
      }

      filesystem.write(
        file,
        writeJsonValue(
          emptyObjectFile,
          file,
          ["extends"],
          [
            `./${relativeWithin(root, tsconfigPath)}`,
            `${engrenage}/tsconfig/library.dist.json`,
          ],
        ),
      );
    },
  };
}
