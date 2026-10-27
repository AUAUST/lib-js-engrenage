import { includes } from "@auaust/primitive-kit/arrays";

import { distTsconfigFile, engrenage } from "#constants";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { emptyObjectFile } from "#support/json/constants";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import type { Step } from "#support/scaffold/types/Step";

export function createDistTsconfigStep(): Step {
  return {
    name: distTsconfigFile,
    message: `Create ${distTsconfigFile} to check the types of the build output?`,
    isMissing({ config, filesystem, getPresets }) {
      return (
        includes(getPresets(), "library") &&
        config.tsconfigPath !== undefined &&
        config.raw.files?.distTsconfig === undefined &&
        !filesystem.exists(distTsconfigFile)
      );
    },
    plan({ config, filesystem }) {
      const { root, tsconfigPath } = config;

      if (tsconfigPath === undefined) {
        throw new Error(`No tsconfig found in ${root} to extend`);
      }

      filesystem.write(
        distTsconfigFile,
        writeJsonValue(
          emptyObjectFile,
          distTsconfigFile,
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
