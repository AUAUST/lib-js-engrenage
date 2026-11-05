import {
  createPackageJson,
  readSharedPnpmRange,
  type PackageJson,
} from "#project/package/index";
import { resolveLatestPnpm } from "#tools/pnpm/operations/resolveLatestPnpm";
import { writePnpmDeclaration } from "#tools/pnpm/operations/writePnpmDeclaration";
import { resolvePnpmRangeStatus } from "#tools/pnpm/utils/resolvePnpmRangeStatus";
import type { Step } from "#project/steps/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createPnpmStep(): Step<{
  root: Directory;
  packageJson: PackageJson;
  packageJsonPath: File | undefined;
}> {
  return {
    name: "pnpm version",
    message: "Declare the pnpm version of the project in devEngines?",
    isMissing({ get }) {
      return resolvePnpmRangeStatus(get("packageJson")) === "missing";
    },
    plan({ get, filesystem }) {
      const root = get("root");
      const path = get("packageJsonPath");
      const content = path === undefined ? undefined : filesystem.read(path);

      // @debt repeats the "No package.json found" guard of upgrade, createTsdownConfig, createStepContext and syncChangesetConfig
      if (path === undefined || content === undefined) {
        throw new Error(`No package.json found in ${root}`);
      }

      const version = resolveLatestPnpm(root, readSharedPnpmRange().range);

      filesystem.write(
        path,
        writePnpmDeclaration(
          content,
          path,
          createPackageJson({
            root,
            path,
            content,
          }),
          version,
        ),
      );
    },
  };
}
