import { resolveLatestPnpm } from "#pnpm/utils/resolveLatestPnpm";
import { resolvePnpmRangeStatus } from "#pnpm/utils/resolvePnpmRangeStatus";
import { writePnpmDeclaration } from "#pnpm/utils/writePnpmDeclaration";
import { createPackageJson } from "#support/packageJson/utils/createPackageJson";
import { readSharedPnpmRange } from "#support/packageJson/utils/readSharedPnpmRange";
import type { Step } from "#support/scaffold/types/Step";

export function createPnpmStep(): Step {
  return {
    name: "pnpm version",
    message: "Declare the pnpm version of the project in devEngines?",
    isMissing({ config }) {
      return resolvePnpmRangeStatus(config.packageJson) === "missing";
    },
    plan({ config, filesystem }) {
      const path = config.packageJsonPath;
      const content = path === undefined ? undefined : filesystem.read(path);

      // @debt repeats the "No package.json found" guard of upgrade, createTsdownConfig, createStepContext and syncChangesetConfig
      if (path === undefined || content === undefined) {
        throw new Error(`No package.json found in ${config.root}`);
      }

      const version = resolveLatestPnpm(
        config.root,
        readSharedPnpmRange().range,
      );

      filesystem.write(
        path,
        writePnpmDeclaration(
          content,
          path,
          createPackageJson({
            root: config.root,
            path,
            content,
          }),
          version,
        ),
      );
    },
  };
}
